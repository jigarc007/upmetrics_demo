import React, { useState,useEffect } from 'react';
import { Plus, Trash2, X, GripVertical, Edit2, User, Settings, LogOut, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { toast } from 'react-toastify';

const TaskBoardApp = () => {
  const navigate = useNavigate();
  const [boards, setBoards] = useState([]);
  const [showBoardModal, setShowBoardModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedColumnId, setSelectedColumnId] = useState(null);

  const [editingBoard, setEditingBoard] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [boardName, setBoardName] = useState('');
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('');

  const [draggedTask, setDraggedTask] = useState(null);
  const [draggedFromBoard, setDraggedFromBoard] = useState(null);
 const [showProfileMenu, setShowProfileMenu] = useState(false);

   useEffect(() => {
    const handleClickOutside = (e) => {
      if (showProfileMenu && !e.target.closest('.profile-menu-container')) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showProfileMenu]);
  useEffect(() => {
    const fetchBoards = async () => {
      // Fetch boards from server if needed
      let boards=[];

            const columns=await api.get(`/column/get`);
            console.log('Fetched columns for board:', columns.data);
            const tasks=await api.get(`/task/get`);
            console.log('Fetched tasks for board:', tasks.data);
              boards=columns.data.map(col=>{
                return {
                  id: col._id,
                  name: col.name,
                  tasks: tasks.data.filter(task=>task.columnId===col._id).map(t=>({
                    id: t._id,
                    title: t.title,
                    description: t.description,
                    position: t.position,
                    priority: t.priority,
                    dueDate: t.dueDate,
                    columnId: t.columnId,
                  })),  
                };
              // board.columns.map((col)=>{
              //   col.tasks=tasks.data.filter(task=>task.boardId===board._id);
              // })
            });
            console.log('Combined boards with columns and tasks:', boards);
            setBoards(boards);

          // setBoards(response.data);
     
        
    };
    fetchBoards();
  }, []);
  // Board CRUD operations
  const createBoard = () => {
    if (boardName.trim()) {
      const user=JSON.parse(localStorage.getItem('user'));
      api.post('/column/add', { name: boardName, position: 0, userId: user.id })
      .then(response => {  
        const newBoard = response.data.data;
        setBoards([...boards, { id: newBoard._id, name: newBoard.name, tasks: [] }]);
        setBoardName('');
        setShowBoardModal(false);
        toast.success('New board created');
      })
      .catch(error => {
        console.error('Error creating board:', error);
        toast.error('Failed to create board. Please try again.');
      });
     
    }
  };

  const updateBoard = async() => {
    if (boardName.trim() && editingBoard) {
      const res = await api.put(`/column/update/${editingBoard.id}`, { name: boardName })
      if (res.status === 200) {
        setBoards(boards.map(b =>
          b.id === editingBoard.id ? { ...b, name: boardName } : b
        ));
        toast.success('Board updated sucessfully');
      }
      setBoardName('');
      setEditingBoard(null);
      setShowBoardModal(false);
    }
  };

  const deleteBoard = async(boardId) => {
    const res=await api.delete(`/column/del/${boardId}`);
    if(res.status===200){
      toast.success('Board deleted successfully');
      setBoards(boards.filter(b => b.id !== boardId));
    }
  };

  const openEditBoard = (board) => {
    setEditingBoard(board);
    setBoardName(board.name);
    setShowBoardModal(true);
  };

  // Task CRUD operations
  const createTask = async() => {
    if (taskTitle.trim() && selectedColumnId) {

      const findColumn=boards.find(b=>b.id===selectedColumnId);
      const createdTask=await api.post('/task/', {
        title: taskTitle,
        description: taskDescription,   
        columnId: selectedColumnId,
        position: findColumn?.tasks?.length > 0 ? findColumn.tasks[findColumn.tasks.length]?.position + 1 : 0,
        priority: 'Medium',
        dueDate: taskDueDate || null
      });
      const newTask = {
        id: createdTask?.data?.task?._id,
        title: taskTitle,
        description: taskDescription,
        dueDate: taskDueDate || '',
        columnId: selectedColumnId,
      };
      setBoards(boards.map(board => 
        board.id === selectedColumnId 
          ? { ...board, tasks: [...board.tasks, newTask] }
          : board
      ));
      resetTaskForm();
    }
  };
  const handleLogout = () => {
   // Add your logout logic here
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
    setShowProfileMenu(false);
  };

  const handleSettings = () => {
    // Add your settings navigation logic here
    navigate('/profile');
    setShowProfileMenu(false);
  };
const updateTask = async () => {
  if (!taskTitle.trim() || !editingTask) return;

  try {
    const res = await api.put(`/task/${editingTask.id}`, {
      title: taskTitle,
      description: taskDescription,
      dueDate: taskDueDate || null
    });

    // ✅ Update UI ONLY after success
    setBoards(boards.map(board => board.id === selectedColumnId ? { ...board, tasks: board.tasks.map(t => t.id === editingTask.id ? { ...t, title: taskTitle, description: taskDescription, dueDate: taskDueDate || null } : t) } : board));

    // ✅ success toast
    toast.success('Task updated successfully');

    resetTaskForm();
  } catch (error) {
    console.error('Failed to update task:', error);

    // ❌ error toast
    toast.error('Failed to update task. Please try again.');
  }
};


  const deleteTask = (boardId, taskId) => {
    try {
      const res = api.delete(`/task/${taskId}`);
      setBoards(boards.map(board =>
        board.id === boardId
          ? { ...board, tasks: board.tasks.filter(t => t.id !== taskId) }
          : board
      ));
       toast.success('Task deleted successfully');
    } catch (error) {
      console.error('Failed to delete task:', error);
      toast.error('Failed to delete task. Please try again.');
      return;
    }

  };

  const openEditTask = (board, task) => {
    setEditingTask(task);
    setTaskTitle(task.title);
    setTaskDescription(task.description);
    setTaskDueDate(task.dueDate || '');
    setShowTaskModal(true);
  };

  const resetTaskForm = () => {
    setTaskTitle('');
    setTaskDescription('');
    setEditingTask(null);
    setShowTaskModal(false);
  };

  // Drag and drop handlers
  const handleDragStart = (e, task, boardId) => {
    setDraggedTask(task);
    setSelectedColumnId(boardId);
    setDraggedFromBoard(boardId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };
 
const handleDrop = async (e, targetBoardId, targetIndex) => {
  e.preventDefault();

  if (!draggedTask || draggedFromBoard === null) return;

  setBoards(prevBoards => {
    const boardsCopy = structuredClone(prevBoards);

    const sourceBoard = boardsCopy.find(b => b.id === draggedFromBoard);
    const targetBoard = boardsCopy.find(b => b.id === targetBoardId);

    if (!sourceBoard || !targetBoard) return prevBoards;

    // Remove task from source
    const sourceIndex = sourceBoard.tasks.findIndex(
      t => t.id === draggedTask.id
    );
    const [movedTask] = sourceBoard.tasks.splice(sourceIndex, 1);

    // If same board & dragging down, fix index
    let insertIndex = targetIndex;
    if (draggedFromBoard === targetBoardId && sourceIndex < targetIndex) {
      insertIndex -= 1;
    }

    // Insert into target
    targetBoard.tasks.splice(insertIndex, 0, {
      ...movedTask,
      columnId: targetBoardId,
    });

    // Normalize positions
    sourceBoard.tasks.forEach((t, i) => (t.position = i));
    if (sourceBoard !== targetBoard) {
      targetBoard.tasks.forEach((t, i) => (t.position = i));
    }

    return boardsCopy;
  });

  // Backend update
  try {
    await api.put(`/task/${draggedTask.id}`, {
      columnId: targetBoardId,
      position: targetIndex,
    });
  } catch (err) {
    console.error('Failed to update task position', err);
  }

  setDraggedTask(null);
  setDraggedFromBoard(null);
};



  // const styles = {
  //   container: {
  //     minHeight: '100vh',
  //     background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  //     fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
  //   },
  //   header: {
  //     background: 'white',
  //     boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  //     borderBottom: '1px solid #e5e7eb'
  //   },
  //   headerContent: {
  //     maxWidth: '1280px',
  //     margin: '0 auto',
  //     padding: '1rem 1.5rem',
  //     display: 'flex',
  //     justifyContent: 'space-between',
  //     alignItems: 'center'
  //   },
  //   title: {
  //     fontSize: '1.875rem',
  //     fontWeight: 'bold',
  //     background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  //     WebkitBackgroundClip: 'text',
  //     WebkitTextFillColor: 'transparent',
  //     backgroundClip: 'text'
  //   },
  //   newBoardBtn: {
  //     display: 'flex',
  //     alignItems: 'center',
  //     gap: '0.5rem',
  //     background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  //     color: 'white',
  //     padding: '0.5rem 1rem',
  //     borderRadius: '0.5rem',
  //     border: 'none',
  //     cursor: 'pointer',
  //     fontSize: '1rem',
  //     fontWeight: '500',
  //     boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
  //     transition: 'all 0.2s'
  //   },
  //   boardsContainer: {
  //     maxWidth: '1280px',
  //     margin: '0 auto',
  //     padding: '2rem 1.5rem'
  //   },
  //   boardsGrid: {
  //     display: 'grid',
  //     gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
  //     gap: '1.5rem'
  //   },
  //   board: {
  //     background: 'white',
  //     borderRadius: '0.75rem',
  //     boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
  //     overflow: 'hidden',
  //     display: 'flex',
  //     flexDirection: 'column'
  //   },
  //   boardHeader: {
  //     background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  //     padding: '1rem',
  //     color: 'white'
  //   },
  //   boardHeaderTop: {
  //     display: 'flex',
  //     justifyContent: 'space-between',
  //     alignItems: 'center',
  //     marginBottom: '0.75rem'
  //   },
  //   boardTitle: {
  //     fontSize: '1.25rem',
  //     fontWeight: '600',
  //     margin: 0
  //   },
  //   iconBtnGroup: {
  //     display: 'flex',
  //     gap: '0.5rem'
  //   },
  //   iconBtn: {
  //     background: 'rgba(255,255,255,0.2)',
  //     border: 'none',
  //     color: 'white',
  //     padding: '0.25rem',
  //     borderRadius: '0.25rem',
  //     cursor: 'pointer',
  //     display: 'flex',
  //     alignItems: 'center',
  //     justifyContent: 'center',
  //     transition: 'background 0.2s'
  //   },
  //   addTaskBtn: {
  //     width: '100%',
  //     display: 'flex',
  //     alignItems: 'center',
  //     justifyContent: 'center',
  //     gap: '0.5rem',
  //     background: 'rgba(255,255,255,0.2)',
  //     border: 'none',
  //     color: 'white',
  //     padding: '0.5rem 0.75rem',
  //     borderRadius: '0.5rem',
  //     cursor: 'pointer',
  //     fontSize: '0.875rem',
  //     fontWeight: '500',
  //     transition: 'background 0.2s'
  //   },
  //   tasksContainer: {
  //     padding: '1rem',
  //     flex: 1,
  //     overflowY: 'auto',
  //     maxHeight: '400px'
  //   },
  //   emptyTasks: {
  //     color: '#9ca3af',
  //     textAlign: 'center',
  //     fontSize: '0.875rem',
  //     padding: '2rem 0'
  //   },
  //   task: {
  //     background: '#f9fafb',
  //     borderRadius: '0.5rem',
  //     padding: '0.75rem',
  //     cursor: 'move',
  //     border: '1px solid #e5e7eb',
  //     marginBottom: '0.75rem',
  //     transition: 'box-shadow 0.2s'
  //   },
  //   taskContent: {
  //     display: 'flex',
  //     alignItems: 'flex-start',
  //     gap: '0.5rem'
  //   },
  //   taskInfo: {
  //     flex: 1,
  //     minWidth: 0
  //   },
  //   taskTitle: {
  //     fontWeight: '500',
  //     color: '#1f2937',
  //     wordBreak: 'break-word',
  //     margin: 0
  //   },
  //   taskDescription: {
  //     fontSize: '0.875rem',
  //     color: '#6b7280',
  //     marginTop: '0.25rem',
  //     wordBreak: 'break-word'
  //   },
  //   taskActions: {
  //     display: 'flex',
  //     gap: '0.25rem',
  //     opacity: 0,
  //     transition: 'opacity 0.2s'
  //   },
  //   editBtn: {
  //     background: 'transparent',
  //     border: 'none',
  //     color: '#667eea',
  //     padding: '0.25rem',
  //     borderRadius: '0.25rem',
  //     cursor: 'pointer',
  //     display: 'flex',
  //     alignItems: 'center',
  //     transition: 'background 0.2s'
  //   },
  //   deleteBtn: {
  //     background: 'transparent',
  //     border: 'none',
  //     color: '#ef4444',
  //     padding: '0.25rem',
  //     borderRadius: '0.25rem',
  //     cursor: 'pointer',
  //     display: 'flex',
  //     alignItems: 'center',
  //     transition: 'background 0.2s'
  //   },
  //   modal: {
  //     position: 'fixed',
  //     inset: 0,
  //     background: 'rgba(0,0,0,0.5)',
  //     display: 'flex',
  //     alignItems: 'center',
  //     justifyContent: 'center',
  //     padding: '1rem',
  //     zIndex: 1000
  //   },
  //   modalContent: {
  //     background: 'white',
  //     borderRadius: '0.75rem',
  //     boxShadow: '0 20px 25px rgba(0,0,0,0.3)',
  //     maxWidth: '28rem',
  //     width: '100%',
  //     padding: '1.5rem'
  //   },
  //   modalHeader: {
  //     display: 'flex',
  //     justifyContent: 'space-between',
  //     alignItems: 'center',
  //     marginBottom: '1rem'
  //   },
  //   modalTitle: {
  //     fontSize: '1.5rem',
  //     fontWeight: 'bold',
  //     color: '#1f2937',
  //     margin: 0
  //   },
  //   closeBtn: {
  //     background: 'transparent',
  //     border: 'none',
  //     color: '#9ca3af',
  //     cursor: 'pointer',
  //     display: 'flex',
  //     padding: 0
  //   },
  //   input: {
  //     width: '100%',
  //     padding: '0.75rem 1rem',
  //     border: '1px solid #d1d5db',
  //     borderRadius: '0.5rem',
  //     fontSize: '1rem',
  //     outline: 'none',
  //     transition: 'border-color 0.2s, box-shadow 0.2s',
  //     boxSizing: 'border-box'
  //   },
  //   textarea: {
  //     width: '100%',
  //     padding: '0.75rem 1rem',
  //     border: '1px solid #d1d5db',
  //     borderRadius: '0.5rem',
  //     fontSize: '1rem',
  //     outline: 'none',
  //     resize: 'none',
  //     transition: 'border-color 0.2s, box-shadow 0.2s',
  //     marginTop: '1rem',
  //     boxSizing: 'border-box'
  //   },
  //   modalActions: {
  //     display: 'flex',
  //     gap: '0.75rem',
  //     marginTop: '1.5rem'
  //   },
  //   cancelBtn: {
  //     flex: 1,
  //     padding: '0.5rem 1rem',
  //     border: '1px solid #d1d5db',
  //     background: 'white',
  //     color: '#374151',
  //     borderRadius: '0.5rem',
  //     cursor: 'pointer',
  //     fontSize: '1rem',
  //     fontWeight: '500',
  //     transition: 'background 0.2s'
  //   },
  //   submitBtn: {
  //     flex: 1,
  //     padding: '0.5rem 1rem',
  //     border: 'none',
  //     background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  //     color: 'white',
  //     borderRadius: '0.5rem',
  //     cursor: 'pointer',
  //     fontSize: '1rem',
  //     fontWeight: '500',
  //     transition: 'opacity 0.2s'
  //   }
  // };
  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    },
    header: {
      background: 'white',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      borderBottom: '1px solid #e5e7eb'
    },
    headerContent: {
      maxWidth: '1280px',
      margin: '0 auto',
      padding: '1rem 1.5rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    title: {
      fontSize: '1.875rem',
      fontWeight: 'bold',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text'
    },
    headerActions: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem'
    },
    newBoardBtn: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      padding: '0.5rem 1rem',
      borderRadius: '0.5rem',
      border: 'none',
      cursor: 'pointer',
      fontSize: '1rem',
      fontWeight: '500',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      transition: 'all 0.2s'
    },
    profileMenuContainer: {
      position: 'relative'
    },
    profileButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      background: '#f3f4f6',
      border: '1px solid #e5e7eb',
      borderRadius: '0.5rem',
      padding: '0.5rem 0.75rem',
      cursor: 'pointer',
      transition: 'all 0.2s',
      fontSize: '0.875rem',
      fontWeight: '500',
      color: '#374151'
    },
    profileAvatar: {
      width: '32px',
      height: '32px',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontSize: '0.875rem',
      fontWeight: '600'
    },
    dropdown: {
      position: 'absolute',
      top: 'calc(100% + 0.5rem)',
      right: 0,
      background: 'white',
      borderRadius: '0.5rem',
      boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
      border: '1px solid #e5e7eb',
      minWidth: '200px',
      overflow: 'hidden',
      zIndex: 1000
    },
    dropdownItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      padding: '0.75rem 1rem',
      cursor: 'pointer',
      transition: 'background 0.2s',
      border: 'none',
      width: '100%',
      background: 'transparent',
      fontSize: '0.875rem',
      color: '#374151',
      textAlign: 'left'
    },
    dropdownDivider: {
      height: '1px',
      background: '#e5e7eb',
      margin: '0.25rem 0'
    },
    boardsContainer: {
      maxWidth: '1280px',
      margin: '0 auto',
      padding: '2rem 1.5rem'
    },
    boardsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
      gap: '1.5rem'
    },
    board: {
      background: 'white',
      borderRadius: '0.75rem',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    },
    boardHeader: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '1rem',
      color: 'white'
    },
    boardHeaderTop: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '0.75rem'
    },
    boardTitle: {
      fontSize: '1.25rem',
      fontWeight: '600',
      margin: 0
    },
    iconBtnGroup: {
      display: 'flex',
      gap: '0.5rem'
    },
    iconBtn: {
      background: 'rgba(255,255,255,0.2)',
      border: 'none',
      color: 'white',
      padding: '0.25rem',
      borderRadius: '0.25rem',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'background 0.2s'
    },
    addTaskBtn: {
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
      background: 'rgba(255,255,255,0.2)',
      border: 'none',
      color: 'white',
      padding: '0.5rem 0.75rem',
      borderRadius: '0.5rem',
      cursor: 'pointer',
      fontSize: '0.875rem',
      fontWeight: '500',
      transition: 'background 0.2s'
    },
    tasksContainer: {
      padding: '1rem',
      flex: 1,
      overflowY: 'auto',
      maxHeight: '400px'
    },
    emptyTasks: {
      color: '#9ca3af',
      textAlign: 'center',
      fontSize: '0.875rem',
      padding: '2rem 0'
    },
    task: {
      background: '#f9fafb',
      borderRadius: '0.5rem',
      padding: '0.75rem',
      cursor: 'move',
      border: '1px solid #e5e7eb',
      marginBottom: '0.75rem',
      transition: 'box-shadow 0.2s'
    },
    taskContent: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '0.5rem'
    },
    taskInfo: {
      flex: 1,
      minWidth: 0
    },
    taskTitle: {
      fontWeight: '500',
      color: '#1f2937',
      wordBreak: 'break-word',
      margin: 0
    },
    taskDescription: {
      fontSize: '0.875rem',
      color: '#6b7280',
      marginTop: '0.25rem',
      wordBreak: 'break-word'
    },
    taskActions: {
      display: 'flex',
      gap: '0.25rem',
      opacity: 0,
      transition: 'opacity 0.2s'
    },
    editBtn: {
      background: 'transparent',
      border: 'none',
      color: '#667eea',
      padding: '0.25rem',
      borderRadius: '0.25rem',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      transition: 'background 0.2s'
    },
    deleteBtn: {
      background: 'transparent',
      border: 'none',
      color: '#ef4444',
      padding: '0.25rem',
      borderRadius: '0.25rem',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      transition: 'background 0.2s'
    },
    modal: {
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      zIndex: 1000
    },
    modalContent: {
      background: 'white',
      borderRadius: '0.75rem',
      boxShadow: '0 20px 25px rgba(0,0,0,0.3)',
      maxWidth: '28rem',
      width: '100%',
      padding: '1.5rem'
    },
    modalHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '1rem'
    },
    modalTitle: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: '#1f2937',
      margin: 0
    },
    closeBtn: {
      background: 'transparent',
      border: 'none',
      color: '#9ca3af',
      cursor: 'pointer',
      display: 'flex',
      padding: 0
    },
    input: {
      width: '100%',
      padding: '0.75rem 1rem',
      border: '1px solid #d1d5db',
      borderRadius: '0.5rem',
      fontSize: '1rem',
      outline: 'none',
      transition: 'border-color 0.2s, box-shadow 0.2s',
      boxSizing: 'border-box',
      marginTop: '1rem'
    },
    textarea: {
      width: '100%',
      padding: '0.75rem 1rem',
      border: '1px solid #d1d5db',
      borderRadius: '0.5rem',
      fontSize: '1rem',
      outline: 'none',
      resize: 'none',
      transition: 'border-color 0.2s, box-shadow 0.2s',
      marginTop: '1rem',
      boxSizing: 'border-box'
    },
    modalActions: {
      display: 'flex',
      gap: '0.75rem',
      marginTop: '1.5rem'
    },
    cancelBtn: {
      flex: 1,
      padding: '0.5rem 1rem',
      border: '1px solid #d1d5db',
      background: 'white',
      color: '#374151',
      borderRadius: '0.5rem',
      cursor: 'pointer',
      fontSize: '1rem',
      fontWeight: '500',
      transition: 'background 0.2s'
    },
    submitBtn: {
      flex: 1,
      padding: '0.5rem 1rem',
      border: 'none',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      borderRadius: '0.5rem',
      cursor: 'pointer',
      fontSize: '1rem',
      fontWeight: '500',
      transition: 'opacity 0.2s'
    }
  };
   return (
      <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <h1 style={styles.title}>Task Board Manager</h1>
          <div style={styles.headerActions}>
            <button
              style={styles.newBoardBtn}
              onClick={() => {
                setEditingBoard(null);
                setBoardName('');
                setShowBoardModal(true);
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <Plus size={20} />
              New Board
            </button>

            {/* Profile Menu */}
            <div className="profile-menu-container" style={styles.profileMenuContainer}>
              <button
                style={styles.profileButton}
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                onMouseOver={(e) => e.currentTarget.style.background = '#e5e7eb'}
                onMouseOut={(e) => e.currentTarget.style.background = '#f3f4f6'}
              >
                <div style={styles.profileAvatar}>
                  <User size={18} />
                </div>
                <span>Account</span>
                <ChevronDown size={16} style={{ 
                  transition: 'transform 0.2s',
                  transform: showProfileMenu ? 'rotate(180deg)' : 'rotate(0deg)'
                }} />
              </button>

              {showProfileMenu && (
                <div style={styles.dropdown}>
                  <button
                    style={styles.dropdownItem}
                    onClick={handleSettings}
                    onMouseOver={(e) => e.currentTarget.style.background = '#f9fafb'}
                    onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <Settings size={18} />
                    <span>Settings</span>
                  </button>
                  <div style={styles.dropdownDivider} />
                  <button
                    style={styles.dropdownItem}
                    onClick={handleLogout}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background = '#fee2e2';
                      e.currentTarget.style.color = '#dc2626';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = '#374151';
                    }}
                  >
                    <LogOut size={18} />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Boards Container */}
      <div style={styles.boardsContainer}>
        <div style={styles.boardsGrid}>
          {boards.map(board => (
            <div
              key={board.id}
              style={styles.board}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, board.id, board.tasks.length)}
            >
              {/* Board Header */}
              <div style={styles.boardHeader}>
                <div style={styles.boardHeaderTop}>
                  <h2 style={styles.boardTitle}>{board.name}</h2>
                   <div style={styles.iconBtnGroup}>
                    <button
                      style={styles.iconBtn}
                      onClick={() => openEditBoard(board)}
                      onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
                      onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      style={styles.iconBtn}
                      onClick={() => deleteBoard(board.id)}
                      onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
                      onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                <button
                  style={styles.addTaskBtn}
                  onClick={() => {
                    setSelectedColumnId(board.id);
                    setEditingTask(null);
                    setTaskTitle('');
                    setTaskDescription('');
                    setShowTaskModal(true);
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                >
                  <Plus size={18} />
                  Add Task
                </button>
              </div>

              {/* Tasks List */}
              <div style={styles.tasksContainer}>
                {board.tasks.length === 0 ? (
                  <p style={styles.emptyTasks}>No tasks yet</p>
                ) : (
                  board.tasks.map((task,index) => (
                    <div
                      key={task.id}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.stopPropagation(); // 🔥 important
                      }}
                      onDrop={(e) => {
                        e.stopPropagation();
                        handleDrop(e, board.id, index);
                      }}
                    >
                      <div
                        draggable

                        onDragStart={(e) => handleDragStart(e, task, board.id)}
                        style={styles.task}
                        onMouseOver={(e) => {
                          e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
                          const actions = e.currentTarget.querySelector('.task-actions');
                          if (actions) actions.style.opacity = '1';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.boxShadow = 'none';
                          const actions = e.currentTarget.querySelector('.task-actions');
                          if (actions) actions.style.opacity = '0';
                        }}
                      >
                        <div style={styles.taskContent}>
                          <GripVertical size={16} style={{ color: '#9ca3af', marginTop: '2px', flexShrink: 0 }} />
                          <div style={styles.taskInfo}>
                            <h3 style={styles.taskTitle}>{task.title}</h3>
                            {task.description && (
                              <p style={styles.taskDescription}>{task.description}</p>
                            )}
                          </div>
                          <div className="task-actions" style={styles.taskActions}>
                            <button
                              style={styles.editBtn}
                              onClick={() => openEditTask(board, task)}
                              onMouseOver={(e) => e.currentTarget.style.background = '#eef2ff'}
                              onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              style={styles.deleteBtn}
                              onClick={() => deleteTask(board.id, task.id)}
                              onMouseOver={(e) => e.currentTarget.style.background = '#fee2e2'}
                              onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Board Modal */}
      {showBoardModal && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>
                {editingBoard ? 'Edit Board' : 'Create New Board'}
              </h3>
              <button
                style={styles.closeBtn}
                onClick={() => {
                  setShowBoardModal(false);
                  setEditingBoard(null);
                  setBoardName('');
                }}
              >
                <X size={24} />
              </button>
            </div>
            <input
              type="text"
              value={boardName}
              onChange={(e) => setBoardName(e.target.value)}
              placeholder="Board name"
              style={styles.input}
              onKeyPress={(e) => e.key === 'Enter' && (editingBoard ? updateBoard() : createBoard())}
              onFocus={(e) => {
                e.target.style.borderColor = '#667eea';
                e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#d1d5db';
                e.target.style.boxShadow = 'none';
              }}
            />
            <div style={styles.modalActions}>
              <button
                style={styles.cancelBtn}
                onClick={() => {
                  setShowBoardModal(false);
                  setEditingBoard(null);
                  setBoardName('');
                }}
                onMouseOver={(e) => e.currentTarget.style.background = '#f9fafb'}
                onMouseOut={(e) => e.currentTarget.style.background = 'white'}
              >
                Cancel
              </button>
              <button
                style={styles.submitBtn}
                onClick={editingBoard ? updateBoard : createBoard}
                onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'}
                onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
              >
                {editingBoard ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Task Modal */}
      {showTaskModal && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>
                {editingTask ? 'Edit Task' : 'Create New Task'}
              </h3>
              <button
                style={styles.closeBtn}
                onClick={resetTaskForm}
              >
                <X size={24} />
              </button>
            </div>
            <input
              type="text"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              placeholder="Task title"
              style={styles.input}
              onFocus={(e) => {
                e.target.style.borderColor = '#667eea';
                e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#d1d5db';
                e.target.style.boxShadow = 'none';
              }}
            />
            <textarea
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
              placeholder="Task description (optional)"
              rows={4}
              style={styles.textarea}
              onFocus={(e) => {
                e.target.style.borderColor = '#667eea';
                e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#d1d5db';
                e.target.style.boxShadow = 'none';
              }}
            />
            <input type="date" style={styles.input} 
            value={taskDueDate ? new Date(taskDueDate).toISOString().split('T')[0] : ''}
            onChange={(e) => {        
              const dateValue = e.target.value ? new Date(e.target.value) : null;
              setTaskDueDate(dateValue);
            }}
             onFocus={(e) => {
                e.target.style.borderColor = '#667eea';
                e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#d1d5db';
                e.target.style.boxShadow = 'none';
              }}
            />
            <div style={styles.modalActions}>
              <button
                style={styles.cancelBtn}
                onClick={resetTaskForm}
                onMouseOver={(e) => e.currentTarget.style.background = '#f9fafb'}
                onMouseOut={(e) => e.currentTarget.style.background = 'white'}
              >
                Cancel
              </button>
              <button
                style={styles.submitBtn}
                onClick={editingTask ? updateTask : createTask}
                onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'}
                onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
              >
                {editingTask ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskBoardApp;