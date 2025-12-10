import { describe, it, expect } from 'vitest';
import { render, screen } from '@/src/test/test-utils';
import Card from './Card';

describe('Card', () => {
  it('正しくレンダリングされる', () => {
    render(<Card>カードコンテンツ</Card>);
    expect(screen.getByText('カードコンテンツ')).toBeInTheDocument();
  });

  it('子要素が正しく表示される', () => {
    render(
      <Card>
        <h2>タイトル</h2>
        <p>説明文</p>
      </Card>
    );
    expect(screen.getByText('タイトル')).toBeInTheDocument();
    expect(screen.getByText('説明文')).toBeInTheDocument();
  });

  it('基本スタイルが適用される', () => {
    const { container } = render(<Card>テスト</Card>);
    const card = container.firstChild;
    expect(card).toHaveClass('bg-white', 'rounded-xl', 'shadow-lg', 'overflow-hidden');
  });

  it('カスタムclassNameが適用される', () => {
    const { container } = render(<Card className="custom-card">テスト</Card>);
    const card = container.firstChild;
    expect(card).toHaveClass('custom-card');
  });

  it('複数の要素を含むことができる', () => {
    render(
      <Card>
        <div data-testid="element-1">要素1</div>
        <div data-testid="element-2">要素2</div>
        <div data-testid="element-3">要素3</div>
      </Card>
    );
    expect(screen.getByTestId('element-1')).toBeInTheDocument();
    expect(screen.getByTestId('element-2')).toBeInTheDocument();
    expect(screen.getByTestId('element-3')).toBeInTheDocument();
  });
});
