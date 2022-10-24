import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const getAllUsers = async (req: Request, res: Response, next: NextFunction): Promise<object> => {
  await prisma.$connect();
  const users = await prisma.user.findMany();
  return res.status(200).json({
    status: 'success',
    data: users,
  });
};

const getUserById = async (req: Request, res: Response, next: NextFunction) => {
  const id: number = Number(req.params.id);
  await prisma.$connect();
  const user = await prisma.user.findUnique({
    select: {
      firstName: true,
      lastName: true,
      email: true,
      username: true,
      profile: true,
    },
    where: { id },
  });
  return res.status(200).json({
    status: 'success',
    data: { user },
  });
};

const updateUserFEW = async (req: Request, res: Response, next: NextFunction) => {
  const id: number = Number(req.params.id);
  if (req.body.password !== req.body.passwordConfirm) {
    return res.status(200).json({
      status: 'success',
      message: 'Suas senhas não são iguais',
    });
  }
  try {
    if (req.body.password) {
      await prisma.$connect();
      const email = await prisma.user.findUnique({ where: { id }, select: { email: true } });
      const encryptedPassword = await createHash(req.body.password);
      const hash = await createHash(email + req.body.password);
      req.body.password = encryptedPassword;
      req.body.hash = hash;
      req.body.passwordConfirm = undefined;
    }
    await prisma.$connect();
    await prisma.user.update({
      where: { id },
      data: req.body,
    });
    return res.status(200).json({
      status: 'success',
      message: 'Usuário atualizado com sucesso',
    });
  } catch (err) {
    console.log(err);
    return res.status(200).json({
      status: 'fail',
      message: `Não foi possível atualizar o usuário (${err})`,
    });
  }
};

const updateUserALL = async (req: Request, res: Response, next: NextFunction) => {
  let input: Array<unknown> = [];
  for (const value of Object.values(req.body)) {
    input.push(value);
  }
  console.log(
    !input.some((input) => {
      input !== '';
    })
  );
  if (
    !input.some((input) => {
      input !== '';
    })
  ) {
    return res.status(403).json({
      status: 'fail',
      message: 'Para atualizar preencha todas as informações',
    });
  } else {
    const id: number = Number(req.params.id);
    const firstName: string = req.body.firstName;
    const lastName: string = req.body.lastName;
    const email: string = req.body.email;
    const password: string = req.body.password;
    const securPassword = await createHash(password);
    try {
      await prisma.$connect();
      await prisma.user.update({
        where: { id },
        data: {
          firstName,
          lastName,
          email,
          password: securPassword,
        },
      });
      return res.status(200).json({
        status: 'success',
        message: 'Usuário atualizado com sucesso',
      });
    } catch (err) {
      console.log(err);
      return res.status(200).json({
        status: 'fail',
        message: `Não foi possível atualizar o usuário (${err})`,
      });
    }
  }
};

interface ISignUpUser {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  username: string;
}

const addUser = async (
  req: Request<ISignUpUser>,
  res: Response,
  next: NextFunction
): Promise<object> => {
  console.log(req.body);
  for (const [key, value] of Object.entries(req.body)) {
    console.log(key + value);
  }
  if (req.body.password !== req.body.passwordConfirm) {
    return res.status(200).json({
      status: 'success',
      message: 'Suas senhas não são iguais',
    });
  }
  const firstName: string = req.body.firstName;
  const lastName: string = req.body.lastName;
  const email: string = req.body.email;
  const password: string = req.body.password;
  const username: string = req.body.username || `${email.split('@')[0]}-${firstName}`;
  const bio: string = req.body.biograph;

  const encryptedPassword = await createHash(password);
  const hash = await createHash(email + password);

  await prisma.$connect();
  const user = await prisma.user.create({
    data: {
      firstName,
      lastName,
      email,
      username,
      password: encryptedPassword,
      hash,
      profile: {
        create: { bio },
      },
    },
  });
  console.log(user);
  return res.status(200).json({
    status: 'success',
    data: { user },
  });
};

const createHash = (password: string) => {
  const hash = bcrypt.hash(password, 12);
  return hash;
};

export default { getAllUsers, addUser, getUserById, updateUserALL, updateUserFEW };
