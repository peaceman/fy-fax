import { SelectQueryBuilder } from "typeorm";

export async function* pageQuery<T>(qb: SelectQueryBuilder<T>, pageSize: number = 100) {
  let alreadyTaken = 0;

  while (true) {
    const results = await qb
      .skip(alreadyTaken)
      .take(pageSize)
      .getMany();

    yield* results;

    alreadyTaken += results.length;

    if (results.length === 0)
      break;
  }
}

export async function* pageQueryUntilEmpty<T>(qb: SelectQueryBuilder<T>, pageSize: number = 100) {
  while (true) {
    const results = await qb
      .take(pageSize)
      .getMany();

    yield* results;

    if (results.length === 0)
      break;
  }
}

export async function* chunkQuery<T>(qb: SelectQueryBuilder<T>, chunkSize: number = 10) {
  let alreadyTaken = 0;

  while (true) {
    const results = await qb
      .skip(alreadyTaken)
      .take(chunkSize)
      .getMany();

    yield results;

    alreadyTaken += results.length;

    if (results.length === 0)
      break;
  }
}

export async function* chunkQueryUntilEmpty<T>(qb: SelectQueryBuilder<T>, chunkSize: number = 10) {
  while (true) {
    const results = await qb
      .take(chunkSize)
      .getMany();

    yield results;

    if (results.length === 0)
      break;
  }
}
