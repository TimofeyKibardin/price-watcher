import { CronJob } from 'cron';
import { GET } from '@/app/api/cron/route';

let cronLock = false;

export const cronJob = new CronJob(
	'0 */5 * * * *',
	function() {
		console.log('cronLock: ' + cronLock);
		if (cronLock) return;
		cronLock = true;

		try {
			console.log('Обновление товаров, время: ' + new Date());
    		GET();
		} catch (err) {
			console.log(err);
		}
		cronLock = false;
	},
	null,
	false,
	'Europe/Moscow'
);