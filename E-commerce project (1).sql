CREATE TABLE "products" (
  "id" serial PRIMARY KEY,
  "name" varchar NOT NULL,
  "price" numeric NOT NULL,
  "stock" int,
  "description" varchar(100),
  "category_id" int
);

CREATE TABLE "accounts" (
  "id" serial PRIMARY KEY,
  "username" varchar NOT NULL,
  "email" varchar,
  "password" varchar NOT NULL
);

CREATE TABLE "carts" (
  "id" integer PRIMARY KEY,
  "account_id" integer UNIQUE,
  "created_at" timestamp,
  "updated_at" timestamp,
  "checked_out" bool DEFAULT false,
  "total_price" numeric
);

CREATE TABLE "orders" (
  "id" integer PRIMARY KEY,
  "order_date" date,
  "total_price" numeric,
  "status" varchar,
  "account_id" int
);

CREATE TABLE "products_carts" (
  "product_id" int,
  "cart_id" int,
  "quantity" int,
  "created_at" timestamp,
  "updated_at" timestamp,
  PRIMARY KEY ("product_id", "cart_id")
);

CREATE TABLE "products_orders" (
  "product_id" int,
  "order_id" int,
  "quantity" int,
  PRIMARY KEY ("product_id", "order_id")
);

CREATE TABLE "categories" (
  "id" int PRIMARY KEY,
  "name" varchar
);

CREATE TABLE "accounts_detail" (
  "account_id" serial,
  "full_name" varchar,
  "date_of_birth" date,
  "address" varchar,
  "email" varchar
);

ALTER TABLE "products" ADD FOREIGN KEY ("category_id") REFERENCES "categories" ("id");

ALTER TABLE "carts" ADD FOREIGN KEY ("account_id") REFERENCES "accounts" ("id");

ALTER TABLE "orders" ADD FOREIGN KEY ("account_id") REFERENCES "accounts" ("id");

ALTER TABLE "products_carts" ADD FOREIGN KEY ("product_id") REFERENCES "products" ("id");

ALTER TABLE "products_carts" ADD FOREIGN KEY ("cart_id") REFERENCES "carts" ("id");

ALTER TABLE "products_orders" ADD FOREIGN KEY ("product_id") REFERENCES "products" ("id");

ALTER TABLE "products_orders" ADD FOREIGN KEY ("order_id") REFERENCES "orders" ("id");

ALTER TABLE "accounts_detail" ADD FOREIGN KEY ("account_id") REFERENCES "accounts" ("id");
