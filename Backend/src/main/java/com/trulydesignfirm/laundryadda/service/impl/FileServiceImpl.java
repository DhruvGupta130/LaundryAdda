package com.trulydesignfirm.laundryadda.service.impl;

import com.trulydesignfirm.laundryadda.model.StoredFile;
import com.trulydesignfirm.laundryadda.model.Invoice;
import com.trulydesignfirm.laundryadda.repository.FileRepo;
import com.trulydesignfirm.laundryadda.repository.InvoiceRepo;
import com.trulydesignfirm.laundryadda.service.FileService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FileServiceImpl implements FileService {

    @Value("${file.storage.path}")
    private String storagePath;

    @Value("${laundry.invoice.path}")
    private String invoicePath;

    private final InvoiceRepo invoiceRepo;
    private final FileRepo fileRepo;

    @Override
    public StoredFile saveFile(MultipartFile file) throws IOException {
        StoredFile newFile = new StoredFile();
        Path parentDir = Paths.get(storagePath);
        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains("."))
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        String randomFileName = UUID.randomUUID() + extension;
        Path dest = parentDir.resolve(randomFileName);
        if(Files.notExists(parentDir))
            Files.createDirectories(parentDir);
        file.transferTo(dest);
        newFile.setFileName(randomFileName);
        newFile.setFilePath(dest.toString());
        newFile.setFileSize(file.getSize());
        return fileRepo.save(newFile);
    }

    @Override
    public StoredFile getFile(UUID fileId) throws IOException {
        return fileRepo.findById(fileId)
                .orElseThrow(() -> new IOException("Required StoredFile Not Found"));
    }

    public String deleteFile(UUID fileId) throws IOException {
        StoredFile file = fileRepo.findById(fileId)
                .orElseThrow(() -> new IOException("File not found."));
        String filePath = storagePath + "/" + file.getFileName();
        Path fileToDelete = Paths.get(filePath);
        if (Files.exists(fileToDelete)) {
            Files.delete(fileToDelete);
            fileRepo.delete(file);
            return file.getFileName();
        } else throw new IOException("File " + file.getFileName() + " does not exist.");
    }

    @Override
    public StoredFile uploadFile(Path path) throws IOException {
        StoredFile newFile = new StoredFile();
        Path parentDir = Paths.get(invoicePath);
        Path dest = parentDir.resolve(path.getFileName());
        if(Files.notExists(parentDir))
            Files.createDirectories(parentDir);
        Files.copy(path, dest, StandardCopyOption.REPLACE_EXISTING);
        newFile.setFileName(path.getFileName().toString());
        newFile.setFilePath(dest.toString());
        newFile.setFileSize(Files.size(path));
        return fileRepo.save(newFile);
    }

    @Override
    public Invoice getInvoice(UUID orderId) {
        return invoiceRepo.getInvoiceByOrderId(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Invoice not yet generated"));
    }

}
