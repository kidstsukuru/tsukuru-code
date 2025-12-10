import { describe, it, expect } from 'vitest';
import { render, screen } from '@/src/test/test-utils';
import userEvent from '@testing-library/user-event';
import Input from './Input';

describe('Input', () => {
  it('正しくレンダリングされる', () => {
    render(<Input />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('ラベルが表示される', () => {
    render(<Input label="メールアドレス" />);
    expect(screen.getByText('メールアドレス')).toBeInTheDocument();
    expect(screen.getByLabelText('メールアドレス')).toBeInTheDocument();
  });

  it('入力値が正しく表示される', async () => {
    const user = userEvent.setup();
    render(<Input placeholder="入力してください" />);

    const input = screen.getByPlaceholderText('入力してください');
    await user.type(input, 'テスト入力');

    expect(input).toHaveValue('テスト入力');
  });

  it('エラーメッセージが表示される', () => {
    render(<Input error="エラーが発生しました" />);
    expect(screen.getByText('エラーが発生しました')).toBeInTheDocument();
  });

  it('エラー時は赤い枠線が適用される', () => {
    render(<Input error="エラー" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('border-red-500');
  });

  it('通常時はグレーの枠線が適用される', () => {
    render(<Input />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('border-gray-300');
  });

  it('typeプロパティが正しく適用される', () => {
    render(<Input type="password" />);
    const input = screen.getByRole('textbox', { hidden: true });
    expect(input).toHaveAttribute('type', 'password');
  });

  it('placeholderが正しく表示される', () => {
    render(<Input placeholder="メールアドレスを入力" />);
    expect(screen.getByPlaceholderText('メールアドレスを入力')).toBeInTheDocument();
  });

  it('disabled状態が適用される', () => {
    render(<Input disabled />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('カスタムclassNameが適用される', () => {
    render(<Input className="custom-input" />);
    expect(screen.getByRole('textbox')).toHaveClass('custom-input');
  });
});
