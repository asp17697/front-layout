import { memo } from "react";
import { Position } from "@xyflow/react";
import { LabeledHandle } from "@/components/ui/labeled-handle";
import {
  DatabaseSchemaNode,
  DatabaseSchemaNodeHeader,
  DatabaseSchemaNodeBody,
  DatabaseSchemaTableRow,
  DatabaseSchemaTableCell,
} from "@/components/ui/database-schema-node";

export type DatabaseSchemaNodeData = {
  data: {
    type: string;
    label: string;
    schema: { title: string; type: string }[];
  };
};

const DatabaseSchemaDemo = memo(({ data }: DatabaseSchemaNodeData) => {
  return (
    <DatabaseSchemaNode
      className={`p-0 ${
      data.type === "datetime"
        ? "bg-blue-50"
        : data.type === "measure"
        ? "bg-yellow-50"
        : "bg-white"
      } shadow-md`}
    >
      <DatabaseSchemaNodeHeader>
        <div className={``}>
          {data.label}
        </div>
      </DatabaseSchemaNodeHeader>
      <DatabaseSchemaNodeBody>
        {data.schema.map((entry) => (
          <DatabaseSchemaTableRow key={entry.title}>
            <DatabaseSchemaTableCell className="pl-0 pr-6 font-light text-black">
              <LabeledHandle
                id={entry.title}
                title={entry.title}
                type="target"
                position={Position.Left}
              />
            </DatabaseSchemaTableCell>
            <DatabaseSchemaTableCell className="pr-0 font-thin text-black">
              <LabeledHandle
                id={entry.title}
                title={entry.type}
                type="source"
                position={Position.Right}
                className="p-0"
                handleClassName="p-0"
                labelClassName="p-0 w-full pr-3 text-right"
              />
            </DatabaseSchemaTableCell>
          </DatabaseSchemaTableRow>
        ))}
      </DatabaseSchemaNodeBody>
    </DatabaseSchemaNode>
  );
});

DatabaseSchemaDemo.displayName = 'DatabaseSchema';

export default DatabaseSchemaDemo;