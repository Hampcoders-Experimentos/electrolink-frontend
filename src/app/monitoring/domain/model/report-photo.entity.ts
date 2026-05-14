import { BaseEntity } from '../../../shared/infrastructure/base-entity';

export class ReportPhoto implements BaseEntity {
  private _id: string;
  private _reportId: string;
  private _url: string;
  private _fileName: string;
  private _contentType: string;

  constructor(data: {
    id: string;
    reportId: string;
    url: string;
    fileName: string;
    contentType: string;
  }) {
    this._id = data.id;
    this._reportId = data.reportId;
    this._url = data.url;
    this._fileName = data.fileName;
    this._contentType = data.contentType;
  }

  get id(): string {
    return this._id;
  }

  get reportId(): string {
    return this._reportId;
  }

  get url(): string {
    return this._url;
  }

  get fileName(): string {
    return this._fileName;
  }

  get contentType(): string {
    return this._contentType;
  }
}
