import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormGroupDirective, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { first } from 'rxjs';
import { Especialidade } from 'src/app/models/especialidade.model';
import { Estado } from 'src/app/models/estado.model';
import { CepService } from 'src/app/services/cep.service';
import { DoutorService } from 'src/app/services/doutor.service';
import { EspecialidadeService } from 'src/app/services/especialidade.service';
import { EstadoService } from 'src/app/services/estado.service';
import { Constants } from 'src/app/shared/constants';
import { cpfValidator } from 'src/app/validators/cpf.validator';

import Swal from 'sweetalert2';


@Component({
  selector: 'app-doutores-form',
  templateUrl: './doutores-form.component.html',
  styleUrls: ['./doutores-form.component.scss']
})
export class DoutoresFormComponent implements OnInit {

  public genericRequired: string = Constants.genericRequired;

  public form: FormGroup;

  public estados: Estado[] | undefined = [];

  public especialidades: Especialidade[] | undefined = [];

  public validating: boolean = false;

  @ViewChild('formDirective') private formDirective?: NgForm

  constructor(private formBuilder: FormBuilder,
    private estadoService: EstadoService,
    private doutorService: DoutorService,
    private especialidadeService: EspecialidadeService,
    private router: Router,
    private cepService: CepService,
  ) {
    this.form = this.formBuilder.group({
      'nu_crm': [null, [Validators.required]],
      'no_doutor': [null, [Validators.required]],
      'nu_cpf': [null, [Validators.required, cpfValidator.isValidCpf()]],
      'nu_rg': [null, [Validators.required, Validators.minLength(5)]],
      'nu_telefone': [null],
      'nu_cep': [null, Validators.required],
      'nu_doutor': null,
      'ds_logradouro': [null, Validators.required],
      'ds_bairro': [null, Validators.required],
      'co_estado': [null, Validators.required],
      'ds_cidade': [null, Validators.required],
      'co_especialidade': [null, Validators.required],
    })
    this.form.get('nu_cep')?.valueChanges.subscribe((value) => {
      if (value && value.toString().length >= 8) {
        this.cepService.fillCep(value, this.form);
      }
    })
    this.form.get('nu_cpf')?.valueChanges.subscribe((value) => {
      if (value && value.length == 11) {
        this.validating = true;
        this.doutorService.validateCpf(value).pipe(first()).subscribe((response) => {
          if (!response.success) {
            this.form.get('nu_cpf')?.setErrors({ 'duplicate': true });
            this.validating = false
          } else {
            this.validating = false;
          }
        })
      }
    })

    this.form.get('nu_rg')?.valueChanges.subscribe((value) => {
      if (value && value.length >= 5) {
        this.validating = true;
        this.doutorService.validateRg(value).pipe(first()).subscribe((response) => {
          if (!response.success) {
            this.form.get('nu_rg')?.setErrors({ 'duplicate': true });
            this.validating = false
          } else {
            this.validating = false;
          }
        })
      }
    })
  }

  ngOnInit(): void {
    this.loadEstados();
    this.loadEspecialidades();
  }

  loadEstados() {
    this.estadoService.findAll().pipe(first()).subscribe((response) => {
      this.estados = response.data;
    })
  }

  loadEspecialidades() {
    this.especialidadeService.findAll().pipe(first()).subscribe((response) => {
      this.especialidades = response.data;
    })
  }

  navigateCep() {
    window.open("https://buscacepinter.correios.com.br/app/endereco/index.php", '_blank');
  }

  submit() {
    if (this.form.invalid) {
      return;
    }
    this.doutorService.create(this.form.value).pipe(first()).subscribe((response) => {
      if (response.success) {
        Swal.fire({
          icon: 'success',
          text: response.mensagem,
          color: Constants.success,
          showDenyButton: true,
          denyButtonText: 'Voltar para Início',
          confirmButtonText: 'Continuar',
        }).then((result) => {
          if (result.isDenied) {
            this.router.navigate(['/principal']);
          } else if (result.isConfirmed) {
            this.form.reset();
            this.formDirective?.resetForm();
          }
        });
      }
    })
  }

  validateCrm() {
    this.validating = true;
    this.doutorService.validateCrm(this.form.get('nu_crm')?.value).pipe(first()).subscribe((response) => {
      if (!response.success) {
        this.form.get('nu_crm')?.setErrors({ 'duplicate': true });
        this.validating = false
      } else {
        this.validating = false;
      }
    })
  }

}
