import { BaseResource, BaseResponse } from '../../shared/infrastructure/base-response';

export interface ScheduleResource extends BaseResource {
  id: string | number;
  technicianId: number;
  date: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export interface CreateScheduleResource {
  technicianId: number;
  date: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export interface SchedulesResponse extends BaseResponse {
  schedules: ScheduleResource[];
}
