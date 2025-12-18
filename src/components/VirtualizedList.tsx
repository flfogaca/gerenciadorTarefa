import { FixedSizeList, ListChildComponentProps } from 'react-window';

interface VirtualizedListProps<T> {
  items: T[];
  height: number;
  itemHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
}

export function VirtualizedList<T>({ 
  items, 
  height, 
  itemHeight, 
  renderItem,
  className = ''
}: VirtualizedListProps<T>) {
  const Row = ({ index, style }: ListChildComponentProps) => (
    <div style={style}>
      {renderItem(items[index], index)}
    </div>
  );

  if (items.length === 0) {
    return (
      <div className={`flex items-center justify-center h-64 ${className}`}>
        <p className="text-gray-500">Nenhum item encontrado</p>
      </div>
    );
  }

  return (
    <FixedSizeList
      height={height}
      itemCount={items.length}
      itemSize={itemHeight}
      width="100%"
      className={className}
    >
      {Row}
    </FixedSizeList>
  );
}

