# UI Components

## ConfirmDialog

A reusable confirmation dialog component with customizable styling and behavior.

### Usage with useConfirm Hook (Recommended)

```tsx
import { useConfirm } from '@/hooks/useConfirm';

function MyComponent() {
  const { confirm, ConfirmDialog } = useConfirm();

  const handleDelete = async () => {
    const confirmed = await confirm({
      title: 'Delete Item',
      message: 'Are you sure you want to delete this item? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger', // 'danger' | 'warning' | 'info'
    });

    if (confirmed) {
      // Perform delete action
      console.log('Item deleted');
    }
  };

  return (
    <div>
      <ConfirmDialog />
      <button onClick={handleDelete}>Delete</button>
    </div>
  );
}
```

### Props

- `title` (string, required): Dialog title
- `message` (string, required): Dialog message/description
- `confirmText` (string, optional): Text for confirm button (default: "Confirm")
- `cancelText` (string, optional): Text for cancel button (default: "Cancel")
- `type` ('danger' | 'warning' | 'info', optional): Dialog type affecting colors (default: 'danger')

### Types

- **danger**: Red theme - for destructive actions (delete, remove, etc.)
- **warning**: Yellow theme - for cautionary actions
- **info**: Blue theme - for informational confirmations

### Examples

#### Delete Confirmation
```tsx
const confirmed = await confirm({
  title: 'Delete Book',
  message: 'Are you sure you want to delete this book? This action cannot be undone.',
  confirmText: 'Delete',
  type: 'danger',
});
```

#### Status Update Confirmation
```tsx
const confirmed = await confirm({
  title: 'Update Order Status',
  message: 'Are you sure you want to mark this order as delivered?',
  confirmText: 'Update',
  type: 'info',
});
```

#### Warning Confirmation
```tsx
const confirmed = await confirm({
  title: 'Unsaved Changes',
  message: 'You have unsaved changes. Are you sure you want to leave?',
  confirmText: 'Leave',
  cancelText: 'Stay',
  type: 'warning',
});
```
