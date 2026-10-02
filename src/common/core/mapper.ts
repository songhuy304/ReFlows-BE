export abstract class Mapper<I, O> {
  static mapFrom(param: any): any {
    throw new Error('Method not implemented', param);
  }

  static mapFromArray(params: any[]): any[] {
    return params.map((item) => this.mapFrom(item));
  }

  static mapTo(param: any): any {
    throw new Error('Method not implemented', param);
  }

  static mapToArray(params: any[]): any[] {
    return params.map((item) => this.mapTo(item));
  }
}
