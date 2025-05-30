import { warning } from '$/common/warning';
import { getType } from '..';
import { cacheByReturn } from '../func-handler';
import { isInIframe } from '../ua';

/**
 * 判断是否为 Promise
 */
export function isPromise(value: any): value is Promise<any>;
export function isPromise<T>(value: Promise<T>): value is Promise<T>;
export function isPromise(value: any): value is Promise<any> {
  return (value || false) && typeof value.then === 'function';
}

/**
 * 判断是否为 File
 */
export const isFile = cacheByReturn(() => {
  if (isInIframe()) {
    warning('iframe 中无法正确判断!!!');
    return false;
  }
  if (!File)
    return false;
  if (File.prototype) {
    return (value: any): boolean => Object.prototype.isPrototypeOf.call(File.prototype, value);
  }
  return (value: any): boolean => value instanceof File;
});

/**
 * 判断是否为 Blob
 */
export const isBlob = cacheByReturn(() => {
  if (isInIframe()) {
    warning('iframe 中无法正确判断!!!');
    return false;
  }
  if (!Blob)
    return false;
  if (Blob.prototype) {
    return (value: any): boolean => Object.prototype.isPrototypeOf.call(Blob.prototype, value);
  }
  return (value: any): boolean => value instanceof Blob;
});

/**
 * 判断是否为引用类型数据
 * @param value
 */
export function isObject(value: any): value is object {
  return typeof value === 'object' && value !== null;
}

/**
 * 判断是否为普通对象
 * @param value
 */
export function isPlainObject(value: any): value is Record<string, unknown> {
  return getType(value) === 'object';
}
