package com.trulydesignfirm.laundryadda.controller;

import com.trulydesignfirm.laundryadda.model.Invoice;
import com.trulydesignfirm.laundryadda.service.FileService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.UUID;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
public class FileController {

    private final FileService fileService;

    @Value("${backend_url}")
    private String baseUrl;


    @PostMapping("/upload-image")
    public String uploadImage(@RequestParam("file") MultipartFile file) throws IOException {
        return baseUrl+"/api/files/get-image/"+fileService.saveFile(file).getId();
    }

    @GetMapping("/get-image/{imageId}")
    public ResponseEntity<Resource> getImage(@PathVariable UUID imageId) throws IOException {
        String filePath = fileService.getFile(imageId).getFilePath();
        Path path = Path.of(filePath);
        Resource resource = new FileSystemResource(path);
        if (!resource.exists() || !resource.isReadable()) {
            return ResponseEntity.notFound().build();
        }
        String contentType = Files.probeContentType(path);
        if (contentType == null || !contentType.startsWith("image/")) {
            contentType = "image/jpeg";
        }
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=" + path.getFileName())
                .contentLength(Files.size(path))
                .body(resource);
    }

    @GetMapping("/invoice/{orderId}")
    public ResponseEntity<Resource> getInvoice(@PathVariable UUID orderId) throws IOException {
        Invoice invoice = fileService.getInvoice(orderId);
        Path pdfPath = Path.of(invoice.getFilePath());
        if (!Files.exists(pdfPath)) {
            return ResponseEntity.notFound().build();
        }
        Resource resource = new FileSystemResource(pdfPath);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=" + pdfPath.getFileName())
                .contentType(MediaType.APPLICATION_PDF)
                .contentLength(Files.size(pdfPath))
                .body(resource);
    }

}