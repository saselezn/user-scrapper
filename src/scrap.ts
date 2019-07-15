import { scrapUsers } from './scrapUsers';

const oneMinute = 60 * 1000;

setInterval(() => scrapUsers(), oneMinute);


