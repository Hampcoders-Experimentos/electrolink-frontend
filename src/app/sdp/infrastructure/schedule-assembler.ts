import { BaseAssembler } from '@shared/infrastructure/base-assembler';
import { ScheduleAggregate } from '../domain/model/schedule.entity';
import { ScheduleResource, SchedulesResponse } from './schedule-response';

export class ScheduleAssembler extends BaseAssembler<ScheduleAggregate, ScheduleResource, SchedulesResponse> {

  toEntityFromResource(resource: ScheduleResource): ScheduleAggregate {
    return new ScheduleAggregate({
      id: resource.id,
      technicianId: resource.technicianId,
      date: resource.date,
      startTime: resource.startTime,
      endTime: resource.endTime,
      isAvailable: resource.isAvailable
    });
  }

  toResourceFromEntity(entity: ScheduleAggregate): ScheduleResource {
    return {
      id: entity.id,
      technicianId: entity.technicianId,
      date: entity.date,
      startTime: entity.startTime,
      endTime: entity.endTime,
      isAvailable: entity.isAvailable
    };
  }

  toEntitiesFromResponse(response: SchedulesResponse): ScheduleAggregate[] {
    return response.schedules.map(resource => this.toEntityFromResource(resource));
  }
}
