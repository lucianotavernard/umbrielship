import { Resource } from '@angular/core';

// The value of a resource, or undefined while it has none. Reading value() itself throws once the
// request failed, which would break the template that reads it.
export function resourceValue<T>(resource: Resource<T | undefined>): T | undefined {
  return resource.hasValue() ? resource.value() : undefined;
}
