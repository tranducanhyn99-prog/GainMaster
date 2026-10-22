import React from 'react';

export const StyleSheet = {
  create: <T extends Record<string, unknown>>(styles: T): T => styles,
};

export const View = 'View';
export const Text = 'Text';
export const Pressable = 'Pressable';
export const ScrollView = 'ScrollView';
export const TextInput = 'TextInput';
export const Modal = 'Modal';
export const Image = 'Image';
export const ActivityIndicator = 'ActivityIndicator';
export const KeyboardAvoidingView = 'KeyboardAvoidingView';
export const Platform = { OS: 'ios' };

const TabsScreen = () => null;
export const Tabs = Object.assign(
  ({ children }: { children?: React.ReactNode }) => children ?? null,
  { Screen: TabsScreen }
);

const StackScreen = () => null;
export const Stack = Object.assign(
  ({ children }: { children?: React.ReactNode }) => children ?? null,
  { Screen: StackScreen }
);

export const useRouter = () => ({
  push: () => {},
  replace: () => {},
  back: () => {},
});
