package com.graduateplatform.service;

import com.graduateplatform.entity.PostCategory;
import com.graduateplatform.repository.PostCategoryRepository;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class CategoryService {

    private final PostCategoryRepository repository;

    public CategoryService(PostCategoryRepository repository) {
        this.repository = repository;
    }

    public List<Map<String, Object>> getAll() {
        return repository.findAll().stream().map(c -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", c.getId());
            map.put("code", c.getCode());
            map.put("name", c.getName());
            map.put("description", c.getDescription());
            map.put("sortOrder", c.getSortOrder());
            return map;
        }).toList();
    }
}
