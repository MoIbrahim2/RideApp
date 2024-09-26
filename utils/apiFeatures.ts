import { Ride } from 'src/entites/Ride';
import { User } from 'src/entites/User';
import { SelectQueryBuilder } from 'typeorm';

export class ApiFeatures {
  document: 'ride' | 'user';
  constructor(
    private query: SelectQueryBuilder<User | Ride>,
    private queryString,
  ) {
    if (this.query.expressionMap.mainAlias.target === User) {
      this.document = 'user';
    } else if (this.query.expressionMap.mainAlias.target === Ride) {
      this.document = 'ride';
    }
  }

  parseValue(value: string): any {
    if (value === 'true') return true;
    if (value === 'false') return false;
    if (!isNaN(Number(value))) return Number(value);
    return value;
  }

  convertOperator(op: string) {
    const operatorMap = {
      gte: '>=',
      gt: '>',
      lt: '<',
      lte: '<=',
    };
    return operatorMap[op];
  }
  filter() {
    const queryObj = { ...this.queryString };

    const excludeFields = ['fields', 'sort', 'sortOrder'];
    excludeFields.forEach((el) => delete queryObj[el]);

    //Advanced filtering
    Object.entries(queryObj).forEach(([key, value]) => {
      const [[operator, operatorValue]] = Object.entries(value);

      if (/\b(gte|gt|lte|lt)\b/.test(operator)) {
        const typeOrmOperator = this.convertOperator(operator);
        this.query.andWhere(
          `${this.document}.${key} ${typeOrmOperator} :${key}`,
          {
            [key]: operatorValue,
          },
        );
      } else
        this.query.andWhere(`${this.document}.${key} = :${key}`, {
          [key]: this.parseValue(queryObj[key]),
        });
    });
    return this;
  }

  sort() {
    if (this.queryString.sort && this.queryString.sortOrder) {
      this.query.orderBy(
        `${this.document}.${this.queryString.sort}`,
        this.queryString.sortOrder.toUpperCase(),
      );
    } else {
      this.query = this.query.orderBy(`${this.document}.id`, 'ASC');
    }
    return this;
  }
  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields
        .split(',')
        .map((field) => `${this.document}.${field}`);
      this.query = this.query.select(fields);
    }
    return this;
  }
  returnQuery() {
    return this.query;
  }
}
