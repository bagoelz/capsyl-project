### Before running

- please setting .env file
	```
	PORT=
	JWT_SECRET=""
	APP_URL=

	PORT =
	DATABASE_URL = 

	sample postgresql://[yourusername]:@localhost:5431/[your_db_name]?schema=public
	DATABASE_URL=

	SMTP_HOST=<YOUR-EMAIL-HOST>
	SMTP_PORT=<PORT>
	SMTP_USER=<YOUR_USER_NAME>
	SMTP_PASS=<YOUR_PASS>
	FROM_EMAIL=<example.com>

	REDIS_HOST=localhost
	REDIS_PORT=6379
	```

#First instalation
- Project use Prisma library, for init database
**npm install**
**npx prisma db push**

#Run project
node server.js


# Api Route 
####using jwt and middleware for read permision, put on header `bearer token`, token 
```javascript
 Authentication 
router.post("/auth/register", AuthController.register);
#### register form format
{
    "name":"yourname",
    "email":"your email",
    "password":"your password",
    "password_confirmation":"repeat password"
}
router.post("/auth/login", AuthController.login);
#### login form format
{
    "email":"registered emaill",
    "password":"registered password",
}
after login success , will return value:
{
    "message": "Logged in",
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwibmFtZSI6Ik1haGVzYSBQdXRyYSIsImVtYWlsIjoibXBtYWhlc2FwdXRyYUBnbWFpbC5jb20iLCJpYXQiOjE3MjE0ODY5MjUsImV4cCI6MTcyMjA5MTcyNX0.aj6YJeeiaJeONKkriOriI6oAdZa-gHCq2eGHxYTnI94"
}
router.get("/send-email", AuthController.sendTestEmail);

Product routes
put on header, for autorization
 headers: {
        Authorization: "Bearer " + access_token,
      },
router.get("/product",  ProductController.index);
router.post("/product", authMiddleware, ProductController.store);
router.get("/product/:id", ProductController.show);
router.put("/product/:id", authMiddleware, ProductController.update);
router.delete("/product/:id", authMiddleware, ProductController.destroy);

##### Get modus average
router.get("/emoji/modus", authMiddleware, EmojiController.countModus);
router.get("/emoji/average", authMiddleware, EmojiController.countAverage);
router.get("/emoji/avmds", authMiddleware, EmojiController.countAveMds);
```
