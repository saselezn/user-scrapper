import axios from 'axios';
import * as fs from 'fs';
import { promisify } from 'util';

const fname = './users.json';

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
let page = 0;

if (!fs.existsSync('./avatars')) {
    fs.writeFileSync('./users.json', '[]');
}


export const scrapUsers = async () => {
    const users = await axios.get(`https://reqres.in/api/users?page=${page}`);

    if (users.data.data.length === 0) {
        return;
    }

    const pool = await readFile(fname, 'utf8');
    const newData = (JSON.parse(pool)).concat(users.data.data);

    await writeFile(fname, JSON.stringify(newData));
    page++;
};
