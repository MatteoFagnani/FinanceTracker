package com.financeapp.service;

import com.financeapp.dto.CategoryDto;
import com.financeapp.exception.ResourceNotFoundException;
import com.financeapp.mapper.CategoryMapper;
import com.financeapp.model.Category;
import com.financeapp.model.TransactionType;
import com.financeapp.model.User;
import com.financeapp.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final CategoryMapper categoryMapper;

    public void seedDefaultCategories(User user) {
        List<Category> defaults = new ArrayList<>();

        // Expense Categories
        defaults.add(createCategoryEntity("Alimentari", TransactionType.EXPENSE, "#f87171", user));
        defaults.add(createCategoryEntity("Trasporti", TransactionType.EXPENSE, "#fb923c", user));
        defaults.add(createCategoryEntity("Casa", TransactionType.EXPENSE, "#facc15", user));
        defaults.add(createCategoryEntity("Intrattenimento", TransactionType.EXPENSE, "#4ade80", user));
        defaults.add(createCategoryEntity("Salute", TransactionType.EXPENSE, "#2dd4bf", user));
        defaults.add(createCategoryEntity("Shopping", TransactionType.EXPENSE, "#818cf8", user));
        defaults.add(createCategoryEntity("Bar e Ristoranti", TransactionType.EXPENSE, "#a78bfa", user));
        defaults.add(createCategoryEntity("Istruzione", TransactionType.EXPENSE, "#f472b6", user));
        defaults.add(createCategoryEntity("Altro", TransactionType.EXPENSE, "#94a3b8", user));

        // Income Categories
        defaults.add(createCategoryEntity("Stipendio", TransactionType.INCOME, "#10b981", user));
        defaults.add(createCategoryEntity("Bonus", TransactionType.INCOME, "#34d399", user));
        defaults.add(createCategoryEntity("Investimenti", TransactionType.INCOME, "#3b82f6", user));
        defaults.add(createCategoryEntity("Regali", TransactionType.INCOME, "#fbbf24", user));
        defaults.add(createCategoryEntity("Altro", TransactionType.INCOME, "#94a3b8", user));

        categoryRepository.saveAll(defaults);
    }

    private Category createCategoryEntity(String name, TransactionType type, String color, User user) {
        return Category.builder()
                .name(name)
                .type(type)
                .color(color)
                .user(user)
                .build();
    }

    public List<CategoryDto> getAllCategories(User user) {
        return categoryRepository.findByUserId(user.getId())
                .stream()
                .map(categoryMapper::toDto)
                .collect(Collectors.toList());
    }

    public List<CategoryDto> getCategoriesByType(User user, TransactionType type) {
        return categoryRepository.findByUserIdAndType(user.getId(), type)
                .stream()
                .map(categoryMapper::toDto)
                .collect(Collectors.toList());
    }

    public CategoryDto createCategory(User user, CategoryDto categoryDto) {
        if (categoryRepository.existsByNameAndUserId(categoryDto.getName(), user.getId())) {
            throw new IllegalArgumentException("A category with this name already exists");
        }

        Category category = categoryMapper.toEntity(categoryDto);
        category.setUser(user);

        Category savedCategory = categoryRepository.save(category);
        return categoryMapper.toDto(savedCategory);
    }

    public CategoryDto updateCategory(User user, Long id, CategoryDto categoryDto) {
        Category category = getCategoryAndVerifyOwner(id, user);

        if (!category.getName().equals(categoryDto.getName()) &&
                categoryRepository.existsByNameAndUserId(categoryDto.getName(), user.getId())) {
            throw new IllegalArgumentException("A category with this name already exists");
        }

        category.setName(categoryDto.getName());
        category.setType(categoryDto.getType());
        category.setColor(categoryDto.getColor());

        Category updatedCategory = categoryRepository.save(category);
        return categoryMapper.toDto(updatedCategory);
    }

    public void deleteCategory(User user, Long id) {
        Category category = getCategoryAndVerifyOwner(id, user);
        categoryRepository.delete(category);
    }

    public Category getCategoryAndVerifyOwner(Long id, User user) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));

        if (!category.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("You don't have permission to access this category");
        }

        return category;
    }
}
