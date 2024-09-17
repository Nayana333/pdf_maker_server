import jwt from 'jsonwebtoken';

const generateToken = (id: string):string => {
  return jwt.sign({ id,role:"user" }, process.env.JWT_SECRET as string, {
    expiresIn: '1d', 
  });
};

export default generateToken;