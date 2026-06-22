CREATE TABLE "profiles"(
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "calorie_goal" INTEGER NULL DEFAULT 2000,
    "created_at" TIMESTAMP(0) WITHOUT TIME ZONE NULL DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE
    "profiles" ADD PRIMARY KEY("id");
CREATE TABLE "meal_logs"(
    "id" UUID NOT NULL DEFAULT UUID(), "user_id" UUID NOT NULL, "log_date" DATE NOT NULL DEFAULT CURRENT_DATE, "created_at" TIMESTAMP(0) WITHOUT TIME ZONE NULL DEFAULT CURRENT_TIMESTAMP);
ALTER TABLE
    "meal_logs" ADD PRIMARY KEY("id");
CREATE TABLE "food_entries"(
    "id" UUID NOT NULL DEFAULT UUID(), "log_id" UUID NOT NULL, "user_id" UUID NOT NULL, "meal_type" VARCHAR(255) CHECK
        (
            "meal_type" IN(
                'breakfast',
                'lunch',
                'dinner',
                'snack'
            )
        ) NOT NULL,
        "food_name" TEXT NOT NULL,
        "calories" DECIMAL(7, 2) NOT NULL,
        "protein" DECIMAL(5, 2) NULL,
        "carbs" DECIMAL(5, 2) NULL,
        "fat" DECIMAL(5, 2) NULL,
        "serving_size" DECIMAL(6, 2) NULL DEFAULT 100,
        "created_at" TIMESTAMP(0) WITHOUT TIME ZONE NULL DEFAULT CURRENT_TIMESTAMP);
ALTER TABLE
    "food_entries" ADD PRIMARY KEY("id");
ALTER TABLE
    "food_entries" ADD CONSTRAINT "food_entries_user_id_foreign" FOREIGN KEY("user_id") REFERENCES "profiles"("id");
ALTER TABLE
    "food_entries" ADD CONSTRAINT "food_entries_log_id_foreign" FOREIGN KEY("log_id") REFERENCES "meal_logs"("id");
ALTER TABLE
    "meal_logs" ADD CONSTRAINT "meal_logs_user_id_foreign" FOREIGN KEY("user_id") REFERENCES "profiles"("id");