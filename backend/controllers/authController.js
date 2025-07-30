import User from '../models/User.js';
import AppError from '../utils/AppError.js';
import asyncHandler from 'express-async-handler'; // Para lidar com erros assíncronos
// import generateToken from '../utils/generateToken.js'; // Não é usado aqui, pois o token é gerado no modelo User

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;

  // Basic validation
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  // Check if user exists
  const userExists = await User.findOne({ email });

  if (userExists) {
    return next(new AppError('User already exists', 400));
  }

  // Create user
  const user = await User.create({
    name,
    email,
    password,
  });

  // Gera o token JWT
  const token = user.getSignedJwtToken();

  // Define as opções do cookie para segurança
  const cookieOptions = {
    // Expira o cookie no mesmo tempo que o JWT
    expires: new Date(Date.now() + parseInt(process.env.JWT_COOKIE_EXPIRE) * 24 * 60 * 60 * 1000), 
    httpOnly: true, // Impede acesso via JavaScript no navegador (proteção XSS)
    secure: process.env.NODE_ENV === 'production', // Apenas enviar via HTTPS em produção (Render.com já usa HTTPS)
    // sameSite: 'Lax', // Opcional: proteção CSRF. 'None' se for cross-site e seguro.
  };

  // Envia o token como cookie e os dados do usuário no corpo da resposta
  res.status(201)
     .cookie('token', token, cookieOptions) // Define o cookie 'token'
     .json({
       success: true,
       token, // Opcional: ainda envia no corpo para conveniência ou depuração
       data: { // Dados do usuário para o frontend
         id: user._id,
         name: user.name,
         email: user.email,
         // Adicione outros campos que você queira que o frontend saiba, mas NUNCA a senha
       }
     });
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Basic validation
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  // Check for user
  // .select('+password') é crucial para que a senha hasheada seja retornada para comparação
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return next(new AppError('Invalid credentials', 401));
  }

  // Check if password matches
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return next(new AppError('Invalid credentials', 401));
  }

  // Gera o token JWT
  const token = user.getSignedJwtToken();

  // Define as opções do cookie para segurança
  const cookieOptions = {
    expires: new Date(Date.now() + parseInt(process.env.JWT_COOKIE_EXPIRE) * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    // sameSite: 'Lax', // Opcional: proteção CSRF.
  };

  // Envia o token como cookie e os dados do usuário no corpo da resposta
  res.status(200) // Status 200 para login bem-sucedido
     .cookie('token', token, cookieOptions) // Define o cookie 'token'
     .json({
       success: true,
       token, // Opcional: ainda envia no corpo
       data: { // Dados do usuário para o frontend
         id: user._id,
         name: user.name,
         email: user.email,
         // Adicione outros campos que você queira que o frontend saiba
       }
     });
});

export { registerUser, loginUser };