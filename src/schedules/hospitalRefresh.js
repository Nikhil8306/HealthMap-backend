// To update hospital data frequently

import {CronJob} from "cron";

const job = new CronJob(
    '* * * * * *',
    function () {
        console.log('You will see this message every second');
    },
);

export default job;