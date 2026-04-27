import { create } from 'zustand';

const useBoardWriteStore = create((set) => ({
  title: '',
  content: '',
  tags: [],
  editId: null,

  setTitle: (title) => set({ title }),
  setContent: (content) => set({ content }),
  setTags: (tags) => set({ tags }),
  setEditId: (id) => set({ editId: id }),
  resetForm: () => set({ title: '', content: '', tags: [], editId: null }),
}));

export default useBoardWriteStore;
