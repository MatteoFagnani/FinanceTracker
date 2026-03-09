package com.financeapp.repository;

import com.financeapp.model.Category;
import com.financeapp.model.TransactionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    List<Category> findByUserId(Long userId);

    List<Category> findByUserIdAndType(Long userId, TransactionType type);

    boolean existsByNameAndUserId(String name, Long userId);
}
