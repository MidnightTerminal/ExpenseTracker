import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, TextInput, Modal, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../context/ThemeContext';
import { useExpenses } from '../context/ExpenseContext';
import { AnimatedCard } from '../components/AnimatedCard';
import { ICON_OPTIONS, COLOR_OPTIONS } from '../utils/constants';
import { Category } from '../types';

export const CategoriesScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { colors } = useTheme();
  const { categories, addCategory, updateCategory, deleteCategory } = useExpenses();
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('ellipsis-horizontal');
  const [selectedColor, setSelectedColor] = useState(COLOR_OPTIONS[0]);

  const openAdd = () => {
    setEditingCategory(null);
    setName('');
    setSelectedIcon('ellipsis-horizontal');
    setSelectedColor(COLOR_OPTIONS[0]);
    setShowModal(true);
  };

  const openEdit = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setSelectedIcon(cat.icon);
    setSelectedColor(cat.color);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a category name');
      return;
    }

    if (editingCategory) {
      await updateCategory(editingCategory.id, {
        name: name.trim(),
        icon: selectedIcon,
        color: selectedColor,
      });
    } else {
      await addCategory({
        name: name.trim(),
        icon: selectedIcon,
        color: selectedColor,
        isCustom: true,
      });
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShowModal(false);
  };

  const handleDelete = (cat: Category) => {
    Alert.alert(
      'Delete Category',
      `Are you sure you want to delete "${cat.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteCategory(cat.id),
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Animated.View entering={FadeInDown.springify()} style={styles.header}>
          <View>
            <Text style={[styles.title, { color: colors.text }]}>Categories</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {categories.length} categories
            </Text>
          </View>
          <Pressable style={[styles.addBtn, { backgroundColor: colors.primary }]} onPress={openAdd}>
            <Ionicons name="add" size={24} color="#FFF" />
          </Pressable>
        </Animated.View>

        <View style={styles.grid}>
          {categories.map((cat, index) => (
            <AnimatedCard
              key={cat.id}
              index={index}
              style={styles.categoryCard}
              onPress={() => openEdit(cat)}
            >
              <View style={[styles.catIconCircle, { backgroundColor: cat.color + '20' }]}>
                <Ionicons name={cat.icon as any} size={28} color={cat.color} />
              </View>
              <Text style={[styles.catName, { color: colors.text }]} numberOfLines={2}>
                {cat.name}
              </Text>
              {cat.isCustom && (
                <Pressable style={styles.deleteCatBtn} onPress={() => handleDelete(cat)}>
                  <Ionicons name="close-circle" size={18} color={colors.error} />
                </Pressable>
              )}
              <View style={[styles.catBadge, { backgroundColor: cat.isCustom ? colors.accent + '20' : colors.primary + '20' }]}>
                <Text style={[styles.catBadgeText, { color: cat.isCustom ? colors.accent : colors.primary }]}>
                  {cat.isCustom ? 'Custom' : 'Default'}
                </Text>
              </View>
            </AnimatedCard>
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Add/Edit Modal */}
      <Modal visible={showModal} animationType="slide" transparent>
        <View style={[styles.modalOverlay, { backgroundColor: colors.modalOverlay }]}>
          <Animated.View
            entering={FadeInDown.springify()}
            style={[styles.modalContent, { backgroundColor: colors.surface }]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {editingCategory ? 'Edit Category' : 'New Category'}
              </Text>
              <Pressable onPress={() => setShowModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </Pressable>
            </View>

            <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>Name</Text>
            <TextInput
              style={[styles.modalInput, { backgroundColor: colors.inputBackground, color: colors.text }]}
              value={name}
              onChangeText={setName}
              placeholder="Category name"
              placeholderTextColor={colors.textTertiary}
            />

            <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>Icon</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.iconRow}>
              {ICON_OPTIONS.map(icon => (
                <Pressable
                  key={icon}
                  style={[
                    styles.iconOption,
                    {
                      backgroundColor: selectedIcon === icon ? selectedColor + '20' : colors.surfaceVariant,
                      borderColor: selectedIcon === icon ? selectedColor : 'transparent',
                      borderWidth: 2,
                    },
                  ]}
                  onPress={() => setSelectedIcon(icon)}
                >
                  <Ionicons name={icon as any} size={22} color={selectedIcon === icon ? selectedColor : colors.textSecondary} />
                </Pressable>
              ))}
            </ScrollView>

            <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>Color</Text>
            <View style={styles.colorGrid}>
              {COLOR_OPTIONS.map(color => (
                <Pressable
                  key={color}
                  style={[
                    styles.colorOption,
                    {
                      backgroundColor: color,
                      borderWidth: selectedColor === color ? 3 : 0,
                      borderColor: colors.text,
                    },
                  ]}
                  onPress={() => setSelectedColor(color)}
                >
                  {selectedColor === color && (
                    <Ionicons name="checkmark" size={16} color="#FFF" />
                  )}
                </Pressable>
              ))}
            </View>

            {/* Preview */}
            <View style={[styles.preview, { backgroundColor: colors.surfaceVariant }]}>
              <View style={[styles.previewIcon, { backgroundColor: selectedColor + '20' }]}>
                <Ionicons name={selectedIcon as any} size={24} color={selectedColor} />
              </View>
              <Text style={[styles.previewText, { color: colors.text }]}>
                {name || 'Category Name'}
              </Text>
            </View>

            <Pressable style={[styles.modalSaveBtn, { backgroundColor: colors.primary }]} onPress={handleSave}>
              <Text style={styles.modalSaveBtnText}>
                {editingCategory ? 'Update' : 'Create'} Category
              </Text>
            </Pressable>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 60 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 28, fontWeight: '800' },
  subtitle: { fontSize: 14, marginTop: 4 },
  addBtn: { width: 48, height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  categoryCard: { width: '47%', alignItems: 'center', paddingVertical: 20, position: 'relative' },
  catIconCircle: {
    width: 56, height: 56, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 10,
  },
  catName: { fontSize: 14, fontWeight: '600', textAlign: 'center' },
  deleteCatBtn: { position: 'absolute', top: 8, right: 8 },
  catBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10, marginTop: 8 },
  catBadgeText: { fontSize: 10, fontWeight: '600' },
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '700' },
  modalLabel: { fontSize: 14, fontWeight: '600', marginBottom: 8, marginTop: 16 },
  modalInput: { borderRadius: 12, padding: 14, fontSize: 16 },
  iconRow: { maxHeight: 50 },
  iconOption: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  colorGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  colorOption: {
    width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center',
  },
  preview: {
    flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 14,
    marginTop: 20, gap: 12,
  },
  previewIcon: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  previewText: { fontSize: 16, fontWeight: '600' },
  modalSaveBtn: { padding: 16, borderRadius: 14, alignItems: 'center', marginTop: 20 },
  modalSaveBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});