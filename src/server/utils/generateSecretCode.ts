import { faker } from "@faker-js/faker";

export default () => {
  return faker.number.int({ min: 1000, max: 9999 });
};
