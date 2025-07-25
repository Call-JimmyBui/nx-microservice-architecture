* Deployment Guide Deploy thủ công bằng kubectl (cũ)

# (Example -> notification-service)

1. Quy Trình Triển Khai/Cập Nhật

    # Bước 1: Build Docker Image:

        docker build -t your-dockerhub-username/notification-service:latest 
        -f apps/notification-service/Dockerfile
                
    # Bước 2: Push Image lên Docker Hub

        docker push your-dockerhub-username/notification-service:latest

    # Bước 4: Áp Dụng Cấu Hình Secrets

        kubectl apply -f k8s/notification-service/app-secrets.yaml  

    # Bước 5: Áp Dụng Cấu Hình Deployment

        kubectl apply -f k8s/notification-service/notification-service-deployment.yaml

    # Bước 6: Áp Dụng Cấu Hình Ingress

        kubectl apply -f k8s/notification-service/notification-service-ingress.yaml

    # Bước 7: Buộc Khởi Động Lại Deployment 

        kubectl rollout restart deployment/notification-service-deployment

2. Xác Minh Triển Khai

    # Bước 1: Kiểm tra Trạng thái Pods

        kubectl get pods -l app=notification-service

    # Bước 2: Xem Logs của Pod mới nhất

        kubectl logs <tên_pod_notification_service_mới_nhất>

    # Bước 3: Xác minh Service và Endpoints

        kubectl get svc notification-service
        kubectl get ep notification-service

    # Bước 4: Xác minh Ingress

        kubectl get ingress notification-service-ingress

    # Bước 5: Kiểm tra kết nối từ bên ngoài

        curl http://api.example.com/your-service-path
    * Hoặc nếu không có tên miền cấu hình trong Ingress (chỉ dùng IP)
        curl http://192.168.1.100/your-service-path



