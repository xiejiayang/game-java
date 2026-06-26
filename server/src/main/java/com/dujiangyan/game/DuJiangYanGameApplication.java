package com.dujiangyan.game;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@EnableCaching
@SpringBootApplication
public class DuJiangYanGameApplication {

    public static void main(String[] args) {
        SpringApplication.run(DuJiangYanGameApplication.class, args);
    }
}
