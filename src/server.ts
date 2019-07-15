import * as express from 'express';
import * as helmet from 'helmet';
import * as cors from 'cors';
import * as bodyParser from 'body-parser';
import { INTERNAL_SERVER_ERROR, NOT_FOUND, OK } from 'http-status-codes';
import axios from 'axios';
import * as fs from 'fs';
import { promisify } from 'util';

const serviceUrl = 'https://reqres.in/api/users';
const opts = {
    validateStatus: (status: number) => status < INTERNAL_SERVER_ERROR,
};

const writeFile = promisify(fs.writeFile);
const unlink = promisify(fs.unlink);
const avatarStorage = new Set();

export const initApp = () => {
    const app = express();

    if (!fs.existsSync('./avatars')) {
        fs.mkdirSync('./avatars');
    }


    app.use(cors());
    app.use(helmet());
    app.use(bodyParser.json());

    app.get('/api/user/:id', async (req, res) => {
        const user = await axios.get(`${serviceUrl}/${req.params.id}`, {
            validateStatus: status => status < INTERNAL_SERVER_ERROR,
        });

        if (!user.data.data) {
            return res.status(NOT_FOUND).send({})
        }

        return res.status(OK).send(user.data);
    });

    app.get('/api/user/:id/avatar', async (req, res) => {
        const userId = req.params.id;

        if (avatarStorage.has(req.params.id)) {
            return res.status(OK).download(`./avatars/${userId}.jpg`);
        }

        const user = await axios.get(`${serviceUrl}/${userId}`, opts);

        if (!user.data.data) {
            return res.status(NOT_FOUND).send({})
        }

        const image = await axios.get(user.data.data.avatar, opts);

        await writeFile(`./avatars/${userId}.jpg`, image.data);

        avatarStorage.add(userId);

        return res.status(OK).send(Buffer.from(image.data).toString('base64'));
    });

    app.delete('/api/user/:id/avatar', async (req, res) => {
        const userId = req.params.id;

        if (!avatarStorage.has(req.params.id)) {
            return res.status(NOT_FOUND).send();
        }

        await unlink(`./avatars/${userId}.jpg`);

        avatarStorage.delete(userId);

        return res.status(OK).send();
    });

    return app;
};
