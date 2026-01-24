package com.learnsphere.common.annotation;

import java.lang.annotation.*;

@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface AdminOperation {
    String module() default ""; // e.g. "User Management"

    String action() default ""; // e.g. "Delete User"
}
