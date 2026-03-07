package com.applysmart.auth_service.repository;

import com.applysmart.auth_service.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    Optional<User> findByPhone(String phone);

    boolean existsByEmail(String email);

    boolean existsByPhone(String phone);

    @Transactional
    void deleteByEmailVerifiedFalseAndOtpExpiresAtBefore(long cutoff);
}