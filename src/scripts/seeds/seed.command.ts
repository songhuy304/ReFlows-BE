import { Command, CommandRunner } from 'nest-commander';
import { Injectable } from '@nestjs/common';

@Injectable()
@Command({
  name: 'seed',
  description: 'Seed database',
})
export class SeedCommand extends CommandRunner {
  async run(): Promise<void> {
    console.log('Seeding...');
  }
}
