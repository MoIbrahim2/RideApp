import { CronJob } from 'cron';
import { SchedulerRegistry } from '@nestjs/schedule';
import { User } from 'src/entites/User';
import { Repository } from 'typeorm';
import { HttpException, HttpStatus } from '@nestjs/common';

const locations = [
  ['31.03682443576415', '31.358662721053186'],
  ['31.016717527585627', '31.38811355817565'],
  ['31.040502038133273', '31.37760378022195'],
  ['31.05173325150194', '31.39497656795809'],
  ['31.03421565594279', '31.393527302816025'],
];

export const createUpdateLocationCron = (
  schedulerRegistry: SchedulerRegistry,
  userId,
  User: Repository<User>,
) => {
  const jobName = `updatingLocation_${userId}`;

  const job = new CronJob('*/20 * * * * *', async () =>
    updateLocation(userId, User),
  );
  schedulerRegistry.addCronJob(jobName, job);
  job.start();
};

async function updateLocation(userId, User: Repository<User>) {
  const user = await User.findOne({ where: { id: userId } });
  if (!user)
    throw new HttpException(
      'No such user with this id',
      HttpStatus.BAD_REQUEST,
    );

  const randomIndex = Math.floor(Math.random() * locations.length);
  user.location = locations[randomIndex];
  await User.save(user);
}
