import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/src/test/test-utils';
import userEvent from '@testing-library/user-event';
import Button from './Button';

describe('Button', () => {
  it('正しくレンダリングされる', () => {
    render(<Button>クリック</Button>);
    expect(screen.getByRole('button', { name: 'クリック' })).toBeInTheDocument();
  });

  it('クリックイベントが動作する', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    render(<Button onClick={handleClick}>クリック</Button>);

    await user.click(screen.getByRole('button', { name: 'クリック' }));
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it('disabled状態ではクリックできない', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    render(<Button disabled onClick={handleClick}>クリック</Button>);

    const button = screen.getByRole('button', { name: 'クリック' });
    expect(button).toBeDisabled();

    await user.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('primary variantのスタイルが適用される', () => {
    render(<Button variant="primary">プライマリ</Button>);
    const button = screen.getByRole('button', { name: 'プライマリ' });
    expect(button).toHaveClass('bg-amber-500', 'text-white');
  });

  it('secondary variantのスタイルが適用される', () => {
    render(<Button variant="secondary">セカンダリ</Button>);
    const button = screen.getByRole('button', { name: 'セカンダリ' });
    expect(button).toHaveClass('bg-yellow-200', 'text-yellow-800');
  });

  it('large sizeのスタイルが適用される', () => {
    render(<Button size="large">大きいボタン</Button>);
    const button = screen.getByRole('button', { name: '大きいボタン' });
    expect(button).toHaveClass('py-3', 'px-8', 'text-lg');
  });

  it('normal sizeのスタイルが適用される', () => {
    render(<Button size="normal">通常ボタン</Button>);
    const button = screen.getByRole('button', { name: '通常ボタン' });
    expect(button).toHaveClass('py-2', 'px-4', 'text-base');
  });

  it('カスタムclassNameが適用される', () => {
    render(<Button className="custom-class">カスタム</Button>);
    const button = screen.getByRole('button', { name: 'カスタム' });
    expect(button).toHaveClass('custom-class');
  });
});
