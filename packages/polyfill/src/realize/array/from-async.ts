import type { TConstructor } from '@cmtlyt/base';
import { isArrayLike, withResolvers } from '@cmtlyt/base';
import {
  Call,
  CreateAsyncFromSyncIterator,
  CreateDataPropertyOrThrow,
  GetIterator,
  GetMethod,
  IsCallable,
  IsConstructor,
} from '../../utils';

function throwTypeError(message: string) {
  throw new TypeError(message);
}

export type ArrayFromAsync<T = any> = (
  asyncItems: any,
  mapfn?: (value: any, index: number) => T,
  thisArg?: any,
) => Promise<T[]>;

export async function arrayFromAsync<T = any>(
  this: TConstructor<T[]>,
  asyncItems: any,
  mapfn?: (value: any, index: number) => T,
  thisArg?: any,
): Promise<T[]> {
  // eslint-disable-next-line ts/no-this-alias
  const C = this;

  const promiseCapability = withResolvers<T[]>();

  // Step 3: Define the async closure
  async function fromAsyncClosure() {
    try {
      // a & b: Check and handle mapfn
      const mapping
        = typeof mapfn === 'undefined' ? false : IsCallable(mapfn) ? true : throwTypeError('mapfn is not callable');

      let iteratorRecord;

      // c: Get asyncIterator method or default to sync iterator
      const usingAsyncIterator = GetMethod(asyncItems, Symbol.asyncIterator);
      if (typeof usingAsyncIterator !== 'undefined') {
        iteratorRecord = GetIterator(asyncItems, 'ASYNC');
      }
      else {
        const usingSyncIterator = GetMethod(asyncItems, Symbol.iterator);
        // Convert sync iterator to async
        if (typeof usingSyncIterator !== 'undefined')
          iteratorRecord = CreateAsyncFromSyncIterator(GetIterator(asyncItems, 'SYNC'));
      }

      if (typeof iteratorRecord !== 'undefined') {
        // Process items based on whether C is a constructor or not
        const A = IsConstructor(C) ? new C() : [];
        let k = 0;

        const maxIndex = 2 ** 53 - 1;
        // Iterate over the items

        while (true) {
          if (k >= maxIndex) {
            throwTypeError('Index exceeded 2^53 - 1');
          }
          const Pk = String(k);
          const nextResult = await iteratorRecord.next();
          if (!(nextResult instanceof Object)) {
            throwTypeError('Iterator result is not an object');
          }
          if (nextResult.done) {
            Object.defineProperty(A, 'length', { value: k, writable: true });
            promiseCapability.resolve(A);
            return;
          }
          let nextValue = nextResult.value;
          if (mapping) {
            // @ts-expect-error any
            nextValue = await Promise.resolve(Call(mapfn, thisArg, [nextValue, k]));
          }
          CreateDataPropertyOrThrow(A, Pk, nextValue);
          k++;
        }
      }
      else {
        if (isArrayLike(asyncItems)) {
          const len = asyncItems.length;
          // eslint-disable-next-line unicorn/no-new-array
          const A = IsConstructor(C) ? new C(len) : new Array(len);
          let k = 0;
          while (k < len) {
            const Pk = String(k);
            let kValue = await asyncItems[Pk];
            if (mapping) {
              // @ts-expect-error any
              kValue = await Call(mapfn, thisArg, [kValue, k]);
            }
            CreateDataPropertyOrThrow(A, Pk, kValue);
            k++;
          }
          A.length = len;
          promiseCapability.resolve(A);
        }
      }
    }
    catch (error) {
      promiseCapability.reject(error);
    }
  }

  fromAsyncClosure();

  return promiseCapability.promise;
}
