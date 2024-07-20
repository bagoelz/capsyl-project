import { Router } from "express";
import AuthController from "../controllers/AuthController.js";
import authMiddleware from "../middleware/Authenticate.js";
import ProductController from "../controllers/ProductController.js";
import EmojiController from "../controllers/EmojiController.js";
//import redisCache from "../DB/redis.config.js";

const router = Router();

router.post("/auth/register", AuthController.register);
router.post("/auth/login", AuthController.login);
router.get("/send-email", AuthController.sendTestEmail);

// * Product routes
// router.get("/product", redisCache.route(), ProductController.index); user this route if have redis run
router.get("/product",  ProductController.index);
router.post("/product", authMiddleware, ProductController.store);
router.get("/product/:id", ProductController.show);
router.put("/product/:id", authMiddleware, ProductController.update);
router.delete("/product/:id", authMiddleware, ProductController.destroy);


//modus average
router.get("/emoji/modus", authMiddleware, EmojiController.countModus);
router.get("/emoji/average", authMiddleware, EmojiController.countAverage);
router.get("/emoji/avmds", authMiddleware, EmojiController.countAveMds);
export default router;
