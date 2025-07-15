// apps/common/enums/field-key.enum.ts

export enum UserFieldKey {
  USERNAME = 'USERNAME',
  EMAIL = 'EMAIL',
  USER = 'USER',
  PASSWORD = 'PASSWORD',
  TOKEN = 'TOKEN',
  AUTH = 'AUTH',
  PERMISSION = 'PERMISSION',
}

export enum ProductFieldKey {
  PRODUCT = 'PRODUCT',
  PRODUCT_MISMATCH = 'PRODUCT_MISMATCH',
  PRODUCT_OUT_OF_STOCK = 'PRODUCT_OUT_OF_STOCK',
}

export enum OrderFieldKey {
  ORDER = 'ORDER',
}

export enum ServiceFieldKey {
  SERVICE = 'SERVICE',
}

export const FieldKey = {
  User: UserFieldKey,
  Product: ProductFieldKey,
  Order: OrderFieldKey,
  Service: ServiceFieldKey,
};