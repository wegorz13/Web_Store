import { Request, Response, NextFunction } from "express";

const verifyRoles = (...allowedRoles: number[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req?.roles) {
      res.sendStatus(401);
      return;
    }
    const rolesArray = [...allowedRoles];
    console.log(rolesArray);
    console.log(req.role);

    if (rolesArray.includes(req.role)) {
      const verifiedRole = req.role;
      next();
    } else {
      res.sendStatus(401);
      return;
    }
  };
};

module.exports = verifyRoles;
