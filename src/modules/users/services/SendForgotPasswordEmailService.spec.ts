import AppError from '@shared/errors/AppError';

import FakeUsersRepository from '@modules/users/repositories/fakes/FakeUsersRepository';
import FakeMailProvider from '@shared/container/providers/MailProvider/fakes/FakeMailProvider';
import SendForgotPasswordEmailService from './SendForgotPasswordEmailService';
import FakeUsersTokenRepository from '../repositories/fakes/FakeUserTokensRepository';

let fakeUsersRepository: FakeUsersRepository;
let fakeMailProvider: FakeMailProvider;
let fakeUserTokensRepository: FakeUsersTokenRepository;
let sendForgotUserEmail: SendForgotPasswordEmailService;

describe('SendForgotPasswordEmail', () => {
  beforeEach(() => {
    fakeUsersRepository = new FakeUsersRepository();
    fakeMailProvider = new FakeMailProvider();
    fakeUserTokensRepository = new FakeUsersTokenRepository();

    sendForgotUserEmail = new SendForgotPasswordEmailService(
      fakeUsersRepository,
      fakeMailProvider,
      fakeUserTokensRepository,
    );
  });

  it('should be albe to recover password using sent email', async () => {
    const sendMail = jest.spyOn(fakeMailProvider, 'sendMail');

    await fakeUsersRepository.create({
      name: 'John Doe',
      email: 'johndoe@gmail.com.br',
      password: '123456',
    });

    await sendForgotUserEmail.execute({
      email: 'johndoe@gmail.com.br',
    });

    expect(sendMail).toHaveBeenCalled();
  });

  it('should not be able to recover a non-existing users password', async () => {
    await expect(
      sendForgotUserEmail.execute({
        email: 'johndoe@gmail.com.br',
      }),
    ).rejects.toBeInstanceOf(AppError);
  });

  it('should generate a forgot password token', async () => {
    const generateToken = jest.spyOn(fakeUserTokensRepository, 'generate');

    const user = await fakeUsersRepository.create({
      name: 'John Doe',
      email: 'johndoe@gmail.com.br',
      password: '123456',
    });

    await sendForgotUserEmail.execute({
      email: 'johndoe@gmail.com.br',
    });

    expect(generateToken).toHaveBeenCalledWith(user.id);
  });
});
