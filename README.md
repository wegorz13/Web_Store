# Sklepik Web Store

Sklepik is a React app for online shopping with Express server made in Typescript and with SQLite database. JSONWebToken was used for authentication and authorization.

## Login and registration

![alt text](./images/image.png)

![alt text](./images/image-1.png)
There is data validation. If user is correctly registered, his password is hashed with Bcrypt and saved in database with email and default user role code.

### Authentication

After login, access token and refresh token are created with JSON Web Token.  
Refresh token is saved in database, and access token is kept in state in React using Context.  
On Express side there is middleware for verifying token and role.

## Main page

![alt text](./images/image-2.png)
You can browse all products by name or category.  
<br>
![alt text](./images/image-3.png)

![alt text](./images/image-4.png)
You can delete your own opinions, admin can delete all.  
<br>
![alt text](./images/image-8.png)
Only after you've bought the product you can add an opinion.

## Orders

### Cart

![alt text](./images/image-5.png)

### Order details

![alt text](./images/image-9.png)
Order data validation.

### Order history

![alt text](./images/image-7.png)
