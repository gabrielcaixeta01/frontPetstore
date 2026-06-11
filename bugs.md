Preciso corrigir esse bugs que encontrei navegando como admin, aproveite e corrija para cliente e funcionario quando for necessário:
1. No form de criar pet, no input de peso ele permite a inserção de numero negativo e depois emite a mensagem "devem ser maior ou igual a 0" , mas ao colocar 0 aparece uma notificacao bloqueando, pois no back foi implementado para aceitar apenas valores maiores que 0.
2. Em atendimentos, ordenar as opções que aparecem em ordem alfabetica e tambem permitir a busca nesses inputs.
3. BUG: Ta dando erro ao tentar criar um atendimentos, descubra o motivo e corrija. Tabem dá erro para atualizar o atendimento e a notificação não especifica o erro. Verifique se o erro é nesse repositorio ou no back (chamado backPetstore).
4. Ordenar os serviços por ordem alfabetico com base no seu nome.
5. BUG: Ao tentar criar loja da erro, mas o tratamento é ruim e não se sabe qual foi o problema, descobrir o erro e melhorar o tratamento.
6. Os inputs do form de criar loja devem formator a entrada (cnpj etc, como foi feito no form de usuarios).
7. BUG: Ao editar uma loja, aparece notificação de sucesso, mas os dados permanecem iguais.
8. Ordenar os usuarios por ordem alfabetica, independente do filtro aplicado.
9. BUG: No form de criar/editar funcionario na pagina de usuarios, tem o campo de cpf, mesmo nao mostrando isso na view. Nao tem opção pra editar campos do funcionario: salario, cargo, matricula, loja.