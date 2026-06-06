package com.example.cabunity;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.persistence.autoconfigure.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@EntityScan(basePackages = "com.example.cabunity.entities")
@EnableJpaRepositories(basePackages = "com.example.cabunity.repositories")
public class CabUnityApplication {

    public static void main(String[] args) {
        SpringApplication.run(CabUnityApplication.class, args);
    }

}
