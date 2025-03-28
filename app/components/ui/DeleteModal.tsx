import { RiDeleteBin6Line } from 'react-icons/ri';
import { Dispatch, SetStateAction } from 'react';

interface DeleteModalProps {
  showModal: boolean;
  setShowModal: Dispatch<SetStateAction<boolean>>;
  onConfirm: () => void;
  heading?: string;
  message?: string;
}

const DeleteModal = ({
  showModal,
  setShowModal,
  onConfirm,
  heading = 'Are you sure you want to delete?',
  message = 'This will permanently delete the item.',
}: DeleteModalProps) => {
  return (
    <div 
      className={`fixed inset-0 flex items-center justify-center z-50 transition-opacity duration-300 ease-in-out ${
        showModal ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div
        className="absolute inset-0 bg-background/50"
        onClick={() => setShowModal(false)}
      ></div>
      <div 
        className={`relative text-base bg-accent rounded-lg p-6 w-full max-w-lg flex flex-col transition-transform duration-300 ease-in-out ${
          showModal ? 'translate-y-0' : '-translate-y-10'
        }`}
      >
        <div className="flex items-center mb-9">
          <div className="flex flex-col text-left">
            <h3 className="text-2xl font-bold my-1">
              {heading}
            </h3>
            <p>
              {message}
            </p>
          </div>
        </div>
        <div className="flex justify-end space-x-5 tracking-wide">
          <button
            onClick={() => setShowModal(false)}
            className="px-4 py-2 rounded hover:text-foreground/80 transition-all duration-300 hover:scale-105"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-4 bg-destructive text-primary-foreground dark:text-foreground rounded-full hover:bg-destructive/90 transition-all duration-300 hover:scale-105 flex items-center space-x-2"
          >
            <RiDeleteBin6Line />
            <span>Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;