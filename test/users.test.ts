import * as supertest from 'supertest';
import * as nock from 'nock';
import { expect } from 'chai';
import { initApp } from '../src/server';

const userMock = {
    data: {
        id: 1,
        email: 'george.bluth@reqres.in',
        first_name: 'George',
        last_name: 'Bluth',
        avatar: 'https://s3.amazonaws.com/uifaces/faces/twitter/calebogden/128.jpg'
    }
};

describe('User API', () => {
    let app: any;

    before('Init app', () => {
        app = initApp();
    });

    it('should respond with user data with http status 200', async () => {
        const reqUrl = `/api/user/${userMock.data.id}`;

        nock('https://reqres.in').get(`/api/users/${userMock.data.id}`).reply(200, userMock);
        const res = await supertest(app).get(reqUrl).expect(200);

        expect(res.body).to.deep.equal(userMock);
    });

    it('should respond with {} with http status 404', async () => {
        const reqUrl = `/api/user/${userMock.data.id}`;

        nock('https://reqres.in').get(`/api/users/${userMock.data.id}`).reply(404, {});
        const res = await supertest(app).get(reqUrl).expect(404);

        expect(res.body).to.deep.equal({});
    });

    it('should respond with user avatar in base64 format', async () => {
        const mockImage = 'test_test';
        const reqUrl = `/api/user/${userMock.data.id}/avatar`;

        nock('https://reqres.in').get(`/api/users/${userMock.data.id}`).reply(200, userMock);
        nock('https://s3.amazonaws.com').get('/uifaces/faces/twitter/calebogden/128.jpg').reply(200, mockImage);
        const res = await supertest(app).get(reqUrl).expect(200);

        expect(res.text).to.equal(Buffer.from(mockImage).toString('base64'));
    });
});

