import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/shared/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { Minus, MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";

// Indentation (px) added for each level of nesting.
const INDENT = 28;
// Width reserved for the expand/collapse toggle so leaf rows stay aligned.
const TOGGLE_SIZE = 24;

// The tree API doesn't send a user count yet; read whichever field it lands on.
const getUserCount = (node) =>
  node?.users_count ?? node?.user_count ?? node?.total_users ?? null;

const RoleTreeNode = ({ node, depth, expanded, onToggle, onEdit, onDelete }) => {
  const hasChildren = Array.isArray(node.children) && node.children.length > 0;
  const isOpen = expanded.has(node.id);
  const userCount = getUserCount(node);


  return (
    <div>
      <div
        className="group flex items-center gap-3 rounded-lg py-2 pr-2 hover:bg-gray-50"
        style={{ paddingLeft: depth * INDENT }}
      >
        {hasChildren ? (
          <Button
            variant="outline"
            type="button"
            onClick={() => onToggle(node.id)}
            aria-label={isOpen ? "Collapse" : "Expand"}
            aria-expanded={isOpen}
            className="flex size-6 shrink-0 items-center justify-center rounded-md"
          >
            {isOpen ? (
              <Minus className="size-3.5" />
            ) : (
              <Plus className="size-3.5" />
            )}
          </Button>
        ) : (
          <span
            className="shrink-0"
            style={{ width: TOGGLE_SIZE }}
            aria-hidden
          />
        )}

        <span
          className={cn(
            "text-sm",
            hasChildren ? "font-semibold text-gray-900" : "text-gray-600"
          )}
        >
          {node.role_name}
        </span>

        {userCount != null && (
          <span className="font-mono text-xs text-gray-400">
            {userCount} users
          </span>
        )}

        {node.role_name !== "CEO" && <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              aria-label={`Actions for ${node.role_name}`}
              className="ml-auto flex size-7 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              <MoreHorizontal className="size-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit?.(node)}>
              <Pencil /> Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-500"
              onClick={() => onDelete?.(node)}
            >
              <Trash2 /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>}
      </div>

      <AnimatePresence initial={false}>
        {hasChildren && isOpen && (
          <motion.div
            key="children"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            style={{ overflow: "hidden" }}
          >
            {node.children.map((child) => (
              <RoleTreeNode
                key={child.id}
                node={child}
                depth={depth + 1}
                expanded={expanded}
                onToggle={onToggle}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const RoleTree = ({ roles = [], expanded, onToggle, onEdit, onDelete }) => {
  return (
    <div className="space-y-0.5">
      {roles.map((role) => (
        <RoleTreeNode
          key={role.id}
          node={role}
          depth={0}
          expanded={expanded}
          onToggle={onToggle}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

export default RoleTree;
