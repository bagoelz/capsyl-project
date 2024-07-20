import vine from "@vinejs/vine";
import { CustomErrorReporter } from "./CustomErrorReporter.js";

vine.errorReporter = () => new CustomErrorReporter();

export const productScheme = vine.object({
  category_id: vine.number(),
  name: vine.string().minLength(5).maxLength(125),
  price: vine.number(),
  user_id: vine.number(),
});
