import { useSortable } from "@dnd-kit/react/sortable";
import { TableHead } from "../ui/table";

export function DraggableTableHead({
    header,
    index,
  }) {
    const sortable = useSortable({
      id: header.column.id,
      index,
    });
  
    return (
      <TableHead
        ref={sortable.ref}
        className={cn(
          sortable.isDragging &&
            "opacity-50"
        )}
        style={getColumnSizeStyle(
          header.column
        )}
      >
        {header.isPlaceholder
          ? null
          : flexRender(
              header.column.columnDef.header,
              header.getContext()
            )}
      </TableHead>
    );
  }
