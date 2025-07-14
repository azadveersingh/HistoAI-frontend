import { FC } from 'react';
import { Modal } from '../ui/modal/index';
import {
  Table,
  TableBody,
  TableRow,
  TableCell,
} from '../ui/table/index'; 

interface ProjectDetails {
  _id: string;
  name: string;
  [key: string]: any;
}

interface Props {
  project: ProjectDetails;
  onClose: () => void;
}

const ProjectDetailModal: FC<Props> = ({ project, onClose }) => {
  const excludeFields = ['_id', '__v'];

  const formatValue = (key: string, value: any) => {
    if (!value) return '-';
    if (typeof value === 'string' && key.toLowerCase().includes('date')) {
      try {
        return new Date(value).toLocaleString();
      } catch {
        return value;
      }
    }
    if (Array.isArray(value)) {
      return value.map(v => v?.$oid || v).join(', ');
    }
    if (typeof value === 'object') {
      if ('$oid' in value) return value.$oid;
      if ('$date' in value) return new Date(Number(value.$date.$numberLong)).toLocaleString();
      return JSON.stringify(value, null, 2);
    }
    return value.toString();
  };

  return (
    <Modal isOpen={!!project} onClose={onClose} className="max-w-2xl p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
        {project.name}
      </h2>

      <Table className="w-full text-sm text-left text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
        <TableBody>
          {Object.entries(project).map(([key, value]) => {
            if (excludeFields.includes(key)) return null;
            return (
              <TableRow key={key} className="border-b dark:border-gray-700">
                <TableCell isHeader className="font-medium capitalize text-gray-600 dark:text-gray-400 p-2 w-1/3">
                  {key.replace(/([A-Z])/g, ' $1')}
                </TableCell>
                <TableCell className="text-gray-900 dark:text-gray-200 p-2 break-all">
                  {formatValue(key, value)}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Modal>
  );
};

export default ProjectDetailModal;
